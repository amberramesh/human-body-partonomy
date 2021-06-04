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
      svgHeight: 500,
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      titleY: 20,
      treemapRadius: 205,
      polygonVertices: 60,
      fontScale: d3.scaleLinear(),
      voronoiTreemap: voronoiTreemap(),
      colorMap: new Map(),
      colorPallete: [...colorPallete],
      depth: 0
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
        .text('Human Body Partonomy - Kidney (Dataset v1)')
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
          if (e.target === this.$refs.svg && this.depth > 0) {
              this.depth--;
              this.drawTreemap(this.generateHierarchy());
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
      
      this.fontScale.domain([3, 20]).range([8, 20]).clamp(true);
    },
    drawTreemap(hierarchy) {
      this.resetColorPalette();
      if (this.depth > 0) {
        this.footer.text('(click outside to return to previous level)')
      } else {
        this.footer.text('')
      }
      this.voronoiTreemap.clip(this.outerPolygon)(hierarchy);
      const leaves = hierarchy.leaves();
      
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
              return this.getColor(d.depth > 1 ? d.parent : d);
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
              return this.fontScale((d.value / this.currentRoot.length) * 50)
            });
      
      this.labels.append('text')
        .classed('name', true)
        .html(function(d) {
          return d.data[0]
        });
        
      this.labels.append('text')
        .classed('value', true)
        .text(function(d) { return `(${d.value})` });

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
                if (node.data[1].length || node.data[1].size) {
                  this.depth++;
                  this.drawTreemap(this.generateHierarchy())
                }
            })
      
      hoverers.append('title')
        .text(function(d) { return d.data[0] + '\n' + d.value; });
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
    generateHierarchy(rootData) {
      if (!this.currentRoot) {
        this.currentRoot = rootData;
      }
      const groupedData = d3.group(this.currentRoot, ...groupingFns.slice(0, this.depth + 1));
      this.removeNulls(groupedData);
      return d3.hierarchy(['root', groupedData], childrenAccessorFn)
        .sum(([, value]) => value instanceof Array ? value.length : 1)
        .sort((a, b) => b.value - a.value);
    },
  },
  mounted() {
    d3.csv('kidney_v1.csv').then((rootData) => {
      this.initLayout();
      this.drawTreemap(this.generateHierarchy(rootData));
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
