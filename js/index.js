const w = 1000;
const h = 600;

const legendWidth = 36;
const legendHeight = 15;
const percentages = ["<10%", "10%", "20%", "30%", "40%", "50+%"];

const svg = d3.select(".map")
.append("svg")
.attr("height", h)
.attr("width", w);

const path = d3.geoPath();

let tooltip = d3.select("body")
.append("div")
.attr("class", "tooltip");

const files = ["https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json", "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json"];

Promise.all(files.map((url) => d3.json(url))).then(function(data) {

  let domain = [10, 20, 30, 40, 50, 60];
  let color = d3.scaleThreshold()
    .domain(domain)
    .range(d3.schemeBlues[6]);


  svg.append("g")
    .attr("class", "county")
    .selectAll("path")
    .data(topojson.feature(data[0], data[0].objects.counties).features)
    .enter().append("path")
    .attr("d", path)
    .attr("fill", (d) => {
    let result = data[1].filter((obj) => obj.fips == d.id);
    if (result[0]) { return color(result[0].bachelorsOrHigher) }
    else { //could not find a matching fips id in the data
      console.log('could not find data for: ', d.id);
      return 0;
    }
  })
    .attr("data-fips", (d) => data[0].objects.counties.geometries.id)
    .attr("data-education", (d) => {
    let result = data[1].filter((obj) => obj.fips == d.id);
    if (result[0]) { return result[0].bachelorsOrHigher }
    else { //could not find a matching fips id in the data
      console.log('could not find data for: ', d.id);
      return 0;
    }
  })
    .on("mouseover", (d) => {
    tooltip
      .style("left", d3.event.pageX - 50 +"px")
      .style("top", d3.event.pageY - 50 + "px")
      .style("display", "inline-block")
      .html(() => {
      let stat = data[1].filter((obj) => obj.fips == d.id);
      if (stat[0]) { return stat[0].area_name + ", " + stat[0].state + "<br/>" + stat[0].bachelorsOrHigher + "%"; }
      else { return 0; }
    })
  })
    .on("mouseout", () => {
    tooltip
      .style("display", "none");
  });

  svg.append("g")
    .attr("class", "state")
    .selectAll("path")
    .data(topojson.feature(data[0], data[0].objects.states).features)
    .enter().append("path")
    .attr("d", path);

  svg.append("g")
    .selectAll("rect")
    .data(color.range())
    .enter().append("rect")
    .attr("class", "legendbox")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .attr("x", (d, i) => 630 + (i*legendWidth))
    .attr("y", 40)
    .attr("fill", (d) => d);

  svg.selectAll(null) // legend text
    .data(percentages)
    .enter()
    .append("text")
    .attr("x", (d, i) => 648 + (i*legendWidth))
    .attr("y", 66)
    .attr("font-size", "10px")
    .style("text-anchor", "middle")
    .text(d => d);
});
