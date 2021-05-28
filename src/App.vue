<template>
  <div id="app">
    <svg />
  </div>
</template>

<script>
import { voronoiTreemap } from 'd3-voronoi-treemap'
import * as d3 from 'd3'

export default {
  name: 'App',
  data() {
    return {
      drawingArea: null,
      treemapContainer: null,
      svgWidth: 960,
      svgHeight: 500,
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      titleY: 20,
      treemapRadius: 205,
      polygonVertices: 60,
      outerPolygon: [],
      fontScale: d3.scaleLinear(),
      voronoiTreemap: voronoiTreemap(),
      colorMap: new Map(),
      colorPallete: [
        '#003f5c',
        '#2f4b7c',
        '#665191',
        '#a05195',
        '#d45087',
        '#f95d6a',
        '#ff7c43',
        '#ffa600'
      ]
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
    quarterWidth() {
      return this.width / 4
    },
    quarterHeight() {
      return this.height / 4
    },
    legendsMinY() {
      return this.height - 20
    },
    treemapCenter() { 
      return [ this.halfWidth, this.halfHeight + 5]
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
    computeouterPolygon() {
      const radius = this.treemapRadius;
      let increment = 2 * Math.PI / this.polygonVertices,
          outerPolygon = [];
      
      for (let a = 0, i = 0; i < this.polygonVertices; i++, a += increment) {
        outerPolygon.push(
          [radius + radius * Math.cos(a), radius + radius * Math.sin(a)]
        )
      }
      
      return outerPolygon;
    },
    drawTitle() {
      this.drawingArea.append('text')
        .attr('id', 'title')
        .attr('transform', 'translate('+[this.halfWidth, this.titleY]+')')
        .attr('text-anchor', 'middle')
        .text('Human Body Partonomy - Kidney (Dataset v1)')
    },
    initData() {
      this.outerPolygon = this.computeouterPolygon();
      this.fontScale.domain([3, 20]).range([8, 20]).clamp(true);
    },
    initLayout() {
      const svg = d3.select('svg')
        .attr('width', this.svgWidth)
        .attr('height', this.svgHeight);
      
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
    },
    drawTreemap(hierarchy) {
      const vm = this;
      const leaves = hierarchy.leaves();
      
      this.treemapContainer.append('g')
        .classed('cells', true)
        .attr('transform', 'translate('+[-this.treemapRadius, -this.treemapRadius]+')')
        .selectAll('.cell')
        .data(leaves)
        .enter()
          .append('path')
            .classed('cell', true)
            .attr('d', function(d) { return 'M'+d.polygon.join(',')+'z'; })
            .style('fill', function(d) {
              return vm.getColor(d.parent.data);
            })
        
      const labels = this.treemapContainer.append('g')
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
            .style('font-size', function(d) { return vm.fontScale(d.value); });
      
      labels.append('text')
        .classed('name', true)
        .html(function(d){
          return d.data[0]
        });
        
      labels.append('text')
        .classed('value', true)
        .text(function(d){ return `(${d.value})`; });

      const hoverers = vm.treemapContainer.append('g')
        .classed('hoverers', true)
        .attr('transform', 'translate('+[-this.treemapRadius,-this.treemapRadius]+')')
        .selectAll('.hoverer')
        .data(leaves)
        .enter()
          .append('path')
            .classed('hoverer', true)
            .attr('d', function(d){ return 'M'+d.polygon.join(',')+'z'; });
      
      hoverers.append('title')
        .text(function(d) { return d.data[0] + '\n' + d.value; });
    }
  },
  mounted() {
    const groupingFns = [d => d['AS/2'], d => d['AS/3'], d => d['AS/4']];

    const childrenAccessorFn = ([, value ]) => value.size && Array.from(value);

    d3.csv('kidney_v1.csv').then((rootData) => {
      const groupedData = d3.group(rootData, ...groupingFns);
      const hierarchyData = d3.hierarchy(['kidney', groupedData], childrenAccessorFn)
        .sum(([, value]) => value instanceof Array ? value.length : 1)
        .sort((a, b) => b.value - a.value);
      this.initData();
      this.initLayout(rootData);
      this.voronoiTreemap.clip(this.outerPolygon)(hierarchyData);
      
      this.drawTreemap(hierarchyData);
    });
  }
}
</script>

<style>
#app {
  width: fit-content;
  margin: auto;
}

#title {
  font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
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
}

.label>.name {
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

.legend-color {
  stroke-width: 1px;
  stroke:darkgrey;
}
</style>
