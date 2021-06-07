<template>
  <div id="app">
    <svg ref="svg" />
  </div>
</template>

<script>
import { voronoiTreemap } from 'd3-voronoi-treemap'
import * as d3 from 'd3'
const colorPallete = [
  '#003f5c',
  '#2f4b7c',
  '#665191',
  '#a05195',
  '#d45087',
  '#f95d6a',
  '#ff7c43',
  '#ffa600'
]
const groupingFns = [d => d['AS/2'], d => d['AS/3'], d => d['AS/4'], d=> d['AS/5'], d => d['CT/1'], d => d['BG/1']];
const childrenAccessorFn = ([, value ]) => value.size && Array.from(value);

export default {
  name: 'App',
  data() {
    return {
      currentRoot: null,
      drawingArea: null,
      treemapContainer: null,
      labels: null,
      footer: null,
      svgWidth: 960,
      svgHeight: 700,
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      titleY: 20,
      treemapRadius: 300,
      polygonVertices: 60,
      fontScale: d3.scaleLinear(),
      voronoiTreemap: voronoiTreemap(),
      colorMap: new Map(),
      colorPallete: [...colorPallete],
      rootStack: []
    }
  },
  computed: {
    height() {
      return this.svgHeight - this.margin.top - this.margin.bottom
    },
    width() {
      return this.svgWidth - this.margin.left - this.margin.right
    },
    halfWidth() {
      return this.width / 2
    },
    halfHeight() {
      return this.height / 2
    },
    treemapCenter() { 
      return [this.halfWidth, this.halfHeight]
    },
    outerPolygon() {
      const radius = this.treemapRadius;
      let increment = 2 * Math.PI / this.polygonVertices,
        outerPolygon = [];
      
      for (let a = 0, i = 0; i < this.polygonVertices; i++, a += increment) {
        outerPolygon.push(
          [radius + radius * Math.cos(a), radius + radius * Math.sin(a)]
        )
      }
      
      return outerPolygon;
    }
  },
  methods: {
    randomColor() {
      return `#${Math.floor(Math.random() * (Math.pow(16, 6) - 1)).toString(16)}`;
    },
    getColor(data) {
      if (!this.colorMap.has(data)) {
        this.colorMap.set(data, this.getFromPalette());
      }
      return this.colorMap.get(data);
    },
    getFromPalette() {
      return this.colorPallete.length > 0 ? this.colorPallete.pop() : this.randomColor();
    },
    resetColorPalette() {
      this.colorPallete.splice(0, this.colorPallete.length, ...colorPallete);
    },
    drawTitle() {
      this.drawingArea.append('text')
        .attr('id', 'title')
        .attr('transform', 'translate('+[this.halfWidth, this.titleY]+')')
        .attr('text-anchor', 'middle')
        .text('Human Body Partonomy')
    },
    drawFooter() {
      this.footer = this.drawingArea.append('text')
        .style('font-size', '12px')
        .attr("transform", "translate("+[this.halfWidth, this.height]+")")
        .attr("text-anchor", "middle")
    },
    initLayout() {
      const svg = d3.select('svg')
        .attr('width', this.svgWidth)
        .attr('height', this.svgHeight)
        .on('click', (e) => {
          if (e.target === this.$refs.svg) {
              this.goToPrevious();
            }
          })
      
      this.drawingArea = svg.append('g')
        .classed('drawingArea', true)
        .attr('transform', 'translate('+[this.margin.left, this.margin.top]+')');
      
      this.treemapContainer = this.drawingArea.append('g')
        .classed('treemap-container', true)
        .attr('transform', 'translate('+ this.treemapCenter + ')');
      
      this.treemapContainer.append('path')
        .classed('world', true)
        .attr('transform', 'translate('+[-this.treemapRadius, -this.treemapRadius]+')')
        .attr('d', 'M' + this.outerPolygon.join(',')+'Z');
      
      this.drawTitle();
      this.drawFooter();
      
      this.fontScale.domain([5, 30]).range([10, 30]).clamp(true);
    },
    drawTreemap() {
      this.resetColorPalette();
      if (this.rootStack.length > 0) {
        this.footer.text('(click outside to return to previous level)')
      } else {
        this.footer.text('')
      }
      if (!this.currentRoot.polygon) {
        this.voronoiTreemap.clip(this.outerPolygon)(this.currentRoot);
      }
      const leaves = this.currentRoot.leaves();
      
      this.treemapContainer.append('g')
        .classed('cells', true)
        .attr('transform', 'translate('+[-this.treemapRadius, -this.treemapRadius]+')')
        .selectAll('.cell')
        .data(leaves)
        .enter()
          .append('path')
            .classed('cell', true)
            .attr('d', function(d) { return 'M' + d.polygon.join(',') + 'Z' })
            .style('fill', (d) => {
              return this.getColor(d);
            })
      
      if (this.labels) {
        this.labels.remove();
      }
      this.labels = this.treemapContainer.append('g')
        .classed('labels', true)
        .attr('transform', 'translate('+[-this.treemapRadius, -this.treemapRadius]+')')
        .selectAll('.label')
        .data(leaves)
        .enter()
          .append('g')
            .classed('label', true)
            .attr('transform', function(d) {
              return 'translate('+[d.polygon.site.x, d.polygon.site.y]+')';
            })
            .style('font-size', (d) => {
              return this.fontScale((d.value / d.parent.value) * 50)
            });
      
      this.labels.append('text')
        .classed('name', true)
        .html(function(d) {
          return d.data.label.split('-')[0]
        });
        
      this.labels.append('text')
        .classed('value', true)
        .text(function(d) { return d.data.weight ? `(${d.value})` : '' });

      const hoverers = this.treemapContainer.append('g')
        .classed('hoverers', true)
        .attr('transform', 'translate('+[-this.treemapRadius, -this.treemapRadius]+')')
        .selectAll('.hoverer')
        .data(leaves)
        .enter()
          .append('path')
            .classed('hoverer', true)
            .attr('d', function(d){ return 'M'+ d.polygon.join(',') +'Z'; })
            .on('click', (e, node) => {
              if (node.data.outdegree) {
                this.buildHierarchyFromTree(node.data);
                this.drawTreemap();
              }
            })
      
      hoverers.append('title')
        .text((d) => {
          const ontologyId = d.data.label.split('-')[1];
          let text = ontologyId ? `Ontology ID: ${ontologyId}\n` : '';
          text += `Degree: ${d.data.degree}\nIndegree: ${d.data.indegree}\nOutdegree: ${d.data.outdegree}`;
          return text;
        });
    },
    removeNulls(map) {
      if (!(map instanceof Map)) return;
      for(let key of map.keys()) {
        if (key === '') {
          map.delete(key);
        } else {
          this.removeNulls(map.get(key));
        }
      }
    },
    generateHierarchy(rootData, depth = 0) {
      if (this.currentRoot) {
        this.rootStack.push(this.currentRoot);
      }
      const groupedData = d3.group(rootData, ...groupingFns.slice(0, depth + 1));
      this.removeNulls(groupedData);
      this.currentRoot = d3.hierarchy(['root', groupedData], childrenAccessorFn)
        .sum(([, value]) => value instanceof Array ? value.length : 1)
        .sort((a, b) => b.value - a.value);
    },
    countLeaves(node, leaves) {
      if (node._children.size === 0) {
        leaves.add(node);
        return;
      }
      for (const child of node._children) {
        const childLeaves = new Set();
        this.countLeaves(child, childLeaves);
        childLeaves.forEach(l => leaves.add(l));
      }
      node.weight = leaves.size;
    },
    goToPrevious() {
      if (this.rootStack.length === 0) return;
      this.currentRoot.data._children = this.currentRoot.data.children;
      this.currentRoot.data.children = null;
      this.currentRoot = this.rootStack.pop();
      this.drawTreemap();
    },
    buildTree(rootData) {
      const treeMap = new Map();
      const labels = new Set();
      rootData.forEach(data => {
        labels.add(data['FROM'].trim());
        labels.add(data['TO'].trim());
      });
      for (const label of labels) {
        treeMap.set(label, {
          label,
          _children: new Set(),
          indegree: 0,
          outdegree: 0,
          get degree() {
            return this.indegree + this.outdegree
          },
          weight: 0
        });
      }
      for (const data of rootData) {
        const from = data['FROM'].trim(), to = data['TO'].trim();
        if (from === to) continue;
        const fromData = treeMap.get(from);
        const toData = treeMap.get(to)
        if (!fromData._children.has(toData)) {
          fromData._children.add(toData);
          fromData.outdegree++;
          toData.indegree++;
        }
      }
      const root = treeMap.get('Body');
      this.countLeaves(root, new Set());
      return root;
    },
    buildHierarchyFromTree(treeData) {
      if (this.currentRoot) {
        this.rootStack.push(this.currentRoot);
      }
      if (treeData._children) {
        treeData.children = treeData._children;
        treeData._children = null;
      }
      this.currentRoot = d3.hierarchy(treeData)
        .sum(d => d.weight || 1)
        .sort((a, b) => b.value - a.value);
    }
  },
  mounted() {
    d3.csv('AS-CT-Tree-Combined.csv').then((rootData) => {
      this.initLayout();
      this.buildHierarchyFromTree(this.buildTree(rootData));
      this.drawTreemap();
    });
  }
}
</script>

<style>
#app {
  width: fit-content;
  margin: auto;
  font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
}

#title {
  font-weight: 800;
  font-size: 2em;
}

.world, .cell {
  stroke: #888888;
  stroke-width: 1px;
}

.label {
  text-anchor: middle;
  fill: white;
  text-shadow: -1px -1px 0 #888, 1px -1px 0 #888, -1px 1px 0 #888, 1px 1px 0 #888;
}

.label>.name {
  text-transform: capitalize;
  dominant-baseline: text-after-edge;
}

.label>.value {
  dominant-baseline: text-before-edge;
}

.hoverer {
  fill: transparent;
  stroke: white;
  stroke-width:0px;
}

.hoverer:hover {
  stroke-width: 3px;
}
</style>
