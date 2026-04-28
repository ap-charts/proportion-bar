# proportion-bar

Lightweight responsive proportional bar chart on `<canvas>`. Zero dependencies. Animated. Automatically redraws on resize via `ResizeObserver`.

## Install

~~~html
<script src="https://cdn.jsdelivr.net/gh/ap-charts/proportion-bar@1.1.0/dist/proportion-bar.min.js"></script>
~~~

## Usage

~~~html
<canvas id="chart"></canvas>

<script src="https://cdn.jsdelivr.net/gh/ap-charts/proportion-bar@1.1.0/dist/proportion-bar.min.js"></script>
<script>
  ProportionBar.render('#chart', [
    { value: 10, label: 'name1', color: '#6366f1' },
    { value: 20, label: 'name2', color: '#22c55e' },
    { value: 15, label: 'name3', color: '#f59e0b' },
  ]);
</script>
~~~

## Options

| Option              | Type    | Default    | Description                              |
|---------------------|---------|------------|------------------------------------------|
| `height`            | number  | `48`       | Bar height in px                         |
| `radius`            | number  | `6`        | Border radius                            |
| `gap`               | number  | `3`        | Gap between segments in px               |
| `showLabels`        | boolean | `true`     | Show labels                              |
| `showValues`        | boolean | `true`     | Show values                              |
| `labelPosition`     | string  | `'bottom'` | `'bottom'` / `'top'` / `'inside'`       |
| `fontSize`          | number  | `12`       | Font size in px                          |
| `animate`           | boolean | `true`     | Animate on first render                  |
| `animationDuration` | number  | `600`      | Animation duration in ms                 |

## Instance methods

~~~js
var chart = ProportionBar.render('#chart', data, opts);

chart.update(newData, newOptions); // re-render with new data or options
chart.destroy();                   // remove resize listener, cancel animation
~~~


## License

MIT