(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.ProportionBar = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  var VERSION = '1.1.0';

  var DEFAULTS = {
    height: 48,
    radius: 6,
    gap: 3,
    showLabels: true,
    showValues: true,
    labelPosition: 'bottom',
    fontSize: 12,
    fontFamily: 'system-ui, sans-serif',
    minWidthForLabel: 28,
    animate: true,
    animationDuration: 600,
  };

  function drawChart(ctx, data, opts, displayW, progress) {
    var labelH = (opts.showLabels && opts.labelPosition !== 'inside') ? opts.fontSize * 2 + 10 : 0;
    var totalH = opts.height + labelH;
    ctx.clearRect(0, 0, displayW, totalH);

    var sum = data.reduce(function (acc, d) { return acc + d.value; }, 0);
    var barY = opts.labelPosition === 'top' ? labelH + 6 : 0;
    var x = 0;

    data.forEach(function (item) {
      var proportion = item.value / sum;
      var fullW = proportion * displayW;
      var animW = fullW * progress;
      var drawW = Math.max(0, animW - opts.gap);

      if (drawW <= 0) { x += animW; return; }

      ctx.fillStyle = item.color || '#6366f1';
      ctx.beginPath();
      ctx.roundRect(x, barY, drawW, opts.height, opts.radius);
      ctx.fill();

      var cx = x + drawW / 2;

      if (opts.showLabels && opts.labelPosition === 'inside' && drawW > opts.minWidthForLabel) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = '500 ' + opts.fontSize + 'px ' + opts.fontFamily;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.label, cx, barY + opts.height / 2 - (opts.showValues ? 7 : 0));
        if (opts.showValues) {
          ctx.fillStyle = 'rgba(255,255,255,0.65)';
          ctx.font = '400 ' + (opts.fontSize - 1) + 'px ' + opts.fontFamily;
          ctx.fillText(item.value, cx, barY + opts.height / 2 + 8);
        }
      }

      if (opts.showLabels && opts.labelPosition !== 'inside' && drawW > opts.minWidthForLabel && progress > 0.5) {
        var labelY = opts.labelPosition === 'top'
          ? labelH - 2
          : barY + opts.height + 6 + opts.fontSize;
        var fade = Math.min(1, (progress - 0.5) * 2);
        ctx.globalAlpha = fade;
        ctx.fillStyle = item.color || '#6366f1';
        ctx.font = '500 ' + opts.fontSize + 'px ' + opts.fontFamily;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(item.label, cx, labelY);
        if (opts.showValues) {
          ctx.fillStyle = '#888';
          ctx.font = '400 ' + (opts.fontSize - 1) + 'px ' + opts.fontFamily;
          ctx.fillText(item.value, cx, labelY + opts.fontSize + 2);
        }
        ctx.globalAlpha = 1;
      }

      x += animW;
    });
  }

  function setupCanvas(canvas, opts) {
    var labelH = (opts.showLabels && opts.labelPosition !== 'inside') ? opts.fontSize * 2 + 10 : 0;
    var totalH = opts.height + labelH;
    var dpr = window.devicePixelRatio || 1;
    var displayW = canvas.parentElement ? canvas.parentElement.clientWidth : 320;

    canvas.width = displayW * dpr;
    canvas.height = totalH * dpr;
    canvas.style.width = '100%';
    canvas.style.height = totalH + 'px';
    canvas.style.display = 'block';

    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx: ctx, displayW: displayW };
  }

  function render(target, data, userOptions) {
    if (!data || !data.length) throw new Error('[ProportionBar] data is required');

    var opts = Object.assign({}, DEFAULTS, userOptions || {});

    var canvas;
    if (typeof target === 'string') {
      canvas = document.querySelector(target);
    } else if (target instanceof HTMLCanvasElement) {
      canvas = target;
    } else {
      throw new Error('[ProportionBar] target must be a CSS selector or HTMLCanvasElement');
    }
    if (!canvas) throw new Error('[ProportionBar] canvas element not found');

    var rafId = null;

    function runAnimation() {
      if (rafId) cancelAnimationFrame(rafId);
      var setup = setupCanvas(canvas, opts);
      var ctx = setup.ctx;
      var displayW = setup.displayW;

      if (opts.animate) {
        var start = null;
        function step(ts) {
          if (!start) start = ts;
          var progress = Math.min(1, (ts - start) / opts.animationDuration);
          var eased = 1 - Math.pow(1 - progress, 3);
          drawChart(ctx, data, opts, displayW, eased);
          if (progress < 1) rafId = requestAnimationFrame(step);
        }
        rafId = requestAnimationFrame(step);
      } else {
        drawChart(ctx, data, opts, displayW, 1);
      }
    }

    function redraw() {
      if (rafId) cancelAnimationFrame(rafId);
      var setup = setupCanvas(canvas, opts);
      drawChart(setup.ctx, data, opts, setup.displayW, 1);
    }

    runAnimation();

    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(function () { redraw(); });
      ro.observe(canvas.parentElement || canvas);
      canvas._proportionBarRO = ro;
    } else {
      window.addEventListener('resize', redraw);
      canvas._proportionBarResize = redraw;
    }

    return {
      canvas: canvas,
      destroy: function () {
        if (rafId) cancelAnimationFrame(rafId);
        if (canvas._proportionBarRO) {
          canvas._proportionBarRO.disconnect();
        } else if (canvas._proportionBarResize) {
          window.removeEventListener('resize', canvas._proportionBarResize);
        }
      },
      update: function (newData, newOptions) {
        data = newData || data;
        opts = Object.assign({}, opts, newOptions || {});
        runAnimation();
      }
    };
  }

  return { render: render, version: VERSION };
}));
