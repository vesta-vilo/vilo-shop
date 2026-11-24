// QR Code encoder (ISO/IEC 18004 model 2), written for the lab's QR tool.
// Picks the densest-saving choices by default: the smallest version that
// holds the text, the most compact single mode (numeric < alphanumeric <
// byte), and the mask with the lowest penalty score.
var QR = (function () {
  "use strict";

  var ECC = {
    L: { bits: 1, perBlock: [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], blocks: [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25] },
    M: { bits: 0, perBlock: [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28], blocks: [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49] },
    Q: { bits: 3, perBlock: [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], blocks: [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68] },
    H: { bits: 2, perBlock: [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], blocks: [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81] }
  };
  var ALNUM = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
  // mode indicator, character-count bits for versions 1–9 / 10–26 / 27–40
  var MODES = {
    numeric: { id: 1, count: [10, 12, 14] },
    alphanumeric: { id: 2, count: [9, 11, 13] },
    byte: { id: 4, count: [8, 16, 16] }
  };

  function rawDataModules(ver) {
    var result = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      var numAlign = Math.floor(ver / 7) + 2;
      result -= (25 * numAlign - 10) * numAlign - 55;
      if (ver >= 7) result -= 36;
    }
    return result;
  }
  function dataCodewords(ver, ecc) {
    return Math.floor(rawDataModules(ver) / 8) - ECC[ecc].perBlock[ver] * ECC[ecc].blocks[ver];
  }

  // ── Reed–Solomon over GF(2^8), polynomial 0x11D ──
  function gfMul(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11d);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  }
  function rsDivisor(degree) {
    var result = [];
    for (var i = 0; i < degree - 1; i++) result.push(0);
    result.push(1);
    var root = 1;
    for (var j = 0; j < degree; j++) {
      for (var k = 0; k < result.length; k++) {
        result[k] = gfMul(result[k], root);
        if (k + 1 < result.length) result[k] ^= result[k + 1];
      }
      root = gfMul(root, 2);
    }
    return result;
  }
  function rsRemainder(data, divisor) {
    var result = divisor.map(function () { return 0; });
    data.forEach(function (b) {
      var factor = b ^ result.shift();
      result.push(0);
      divisor.forEach(function (coef, i) { result[i] ^= gfMul(coef, factor); });
    });
    return result;
  }

  // ── Text → the most compact single mode ──
  function utf8(text) {
    var out = [], s = unescape(encodeURIComponent(text));
    for (var i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
    return out;
  }
  function pickMode(text) {
    if (/^[0-9]+$/.test(text)) return "numeric";
    for (var i = 0; i < text.length; i++) if (ALNUM.indexOf(text.charAt(i)) < 0) return "byte";
    return "alphanumeric";
  }
  function segment(text, mode) {
    var bits = [], i;
    function push(value, length) { for (var b = length - 1; b >= 0; b--) bits.push((value >>> b) & 1); }
    if (mode === "numeric") {
      for (i = 0; i < text.length; i += 3) {
        var chunk = text.substr(i, 3);
        push(parseInt(chunk, 10), chunk.length * 3 + 1);
      }
      return { mode: mode, chars: text.length, bits: bits };
    }
    if (mode === "alphanumeric") {
      for (i = 0; i + 1 < text.length; i += 2) push(ALNUM.indexOf(text.charAt(i)) * 45 + ALNUM.indexOf(text.charAt(i + 1)), 11);
      if (i < text.length) push(ALNUM.indexOf(text.charAt(i)), 6);
      return { mode: mode, chars: text.length, bits: bits };
    }
    var bytes = utf8(text);
    bytes.forEach(function (b) { push(b, 8); });
    return { mode: mode, chars: bytes.length, bits: bits };
  }
  function segmentBits(seg, ver) {
    var countBits = MODES[seg.mode].count[ver <= 9 ? 0 : ver <= 26 ? 1 : 2];
    return seg.chars >= 1 << countBits ? Infinity : 4 + countBits + seg.bits.length;
  }

  // ── Module grid ──
  function alignmentPositions(ver) {
    if (ver === 1) return [];
    var size = ver * 4 + 17, numAlign = Math.floor(ver / 7) + 2;
    var step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (numAlign * 2 - 2)) * 2;
    var result = [6];
    for (var pos = size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
    return result;
  }
  var MASKS = [
    function (x, y) { return (x + y) % 2 === 0; },
    function (x, y) { return y % 2 === 0; },
    function (x, y) { return x % 3 === 0; },
    function (x, y) { return (x + y) % 3 === 0; },
    function (x, y) { return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; },
    function (x, y) { return ((x * y) % 2) + ((x * y) % 3) === 0; },
    function (x, y) { return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; },
    function (x, y) { return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0; }
  ];

  function build(ver, ecc, codewords, forcedMask) {
    var size = ver * 4 + 17, m = [], fn = [], x, y, i;
    for (y = 0; y < size; y++) { m.push(new Array(size).fill(false)); fn.push(new Array(size).fill(false)); }
    function set(px, py, dark) { m[py][px] = dark; fn[py][px] = true; }

    function finder(cx, cy) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var dist = Math.max(Math.abs(dx), Math.abs(dy)), xx = cx + dx, yy = cy + dy;
        if (xx >= 0 && xx < size && yy >= 0 && yy < size) set(xx, yy, dist !== 2 && dist !== 4);
      }
    }
    function formatBits(mask) {
      var data = (ECC[ecc].bits << 3) | mask, rem = data, j;
      for (j = 0; j < 10; j++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var bits = ((data << 10) | rem) ^ 0x5412;
      var bit = function (k) { return ((bits >>> k) & 1) !== 0; };
      for (j = 0; j <= 5; j++) set(8, j, bit(j));
      set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
      for (j = 9; j < 15; j++) set(14 - j, 8, bit(j));
      for (j = 0; j < 8; j++) set(size - 1 - j, 8, bit(j));
      for (j = 8; j < 15; j++) set(8, size - 15 + j, bit(j));
      set(8, size - 8, true);
    }

    for (i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    var align = alignmentPositions(ver), n = align.length;
    for (i = 0; i < n; i++) for (var j = 0; j < n; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue;
      for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) set(align[i] + dx, align[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
    formatBits(0);
    if (ver >= 7) {
      var rem = ver;
      for (i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
      var vbits = (ver << 12) | rem;
      for (i = 0; i < 18; i++) {
        var dark = ((vbits >>> i) & 1) !== 0, a = size - 11 + (i % 3), b = Math.floor(i / 3);
        set(a, b, dark); set(b, a, dark);
      }
    }

    // data + error-correction codewords, in the zigzag from the bottom-right corner
    i = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) for (var k = 0; k < 2; k++) {
        x = right - k;
        y = ((right + 1) & 2) === 0 ? size - 1 - vert : vert;
        if (!fn[y][x] && i < codewords.length * 8) {
          m[y][x] = ((codewords[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0;
          i++;
        }
      }
    }

    function applyMask(mask) {
      for (var yy = 0; yy < size; yy++) for (var xx = 0; xx < size; xx++) if (!fn[yy][xx] && MASKS[mask](xx, yy)) m[yy][xx] = !m[yy][xx];
    }
    function penalty() {
      var result = 0, xx, yy, run, color, history;
      function finderCount(h) {
        var c = h[1], core = c > 0 && h[2] === c && h[3] === c * 3 && h[4] === c && h[5] === c;
        return (core && h[0] >= c * 4 && h[6] >= c ? 1 : 0) + (core && h[6] >= c * 4 && h[0] >= c ? 1 : 0);
      }
      function add(h, len) { if (h[0] === 0) len += size; h.pop(); h.unshift(len); }
      function terminate(h, col, len) {
        if (col) { add(h, len); len = 0; }
        len += size; add(h, len);
        return finderCount(h);
      }
      for (var pass = 0; pass < 2; pass++) {
        for (yy = 0; yy < size; yy++) {
          color = false; run = 0; history = [0, 0, 0, 0, 0, 0, 0];
          for (xx = 0; xx < size; xx++) {
            var cell = pass === 0 ? m[yy][xx] : m[xx][yy];
            if (cell === color) {
              run++;
              if (run === 5) result += 3; else if (run > 5) result++;
            } else {
              add(history, run);
              if (!color) result += finderCount(history) * 40;
              color = cell; run = 1;
            }
          }
          result += terminate(history, color, run) * 40;
        }
      }
      for (yy = 0; yy < size - 1; yy++) for (xx = 0; xx < size - 1; xx++) {
        var c0 = m[yy][xx];
        if (c0 === m[yy][xx + 1] && c0 === m[yy + 1][xx] && c0 === m[yy + 1][xx + 1]) result += 3;
      }
      var darkCount = 0;
      for (yy = 0; yy < size; yy++) for (xx = 0; xx < size; xx++) if (m[yy][xx]) darkCount++;
      var total = size * size;
      result += (Math.ceil(Math.abs(darkCount * 20 - total * 10) / total) - 1) * 10;
      return result;
    }

    var mask = forcedMask;
    if (mask === undefined || mask === null || mask < 0) {
      var best = Infinity;
      for (i = 0; i < 8; i++) {
        applyMask(i); formatBits(i);
        var score = penalty();
        if (score < best) { best = score; mask = i; }
        applyMask(i);
      }
    }
    applyMask(mask); formatBits(mask);
    return { modules: m, mask: mask };
  }

  /**
   * encode(text, { ecc: "L" | "M" | "Q" | "H", mask?: 0–7 })
   * → { version, size, mode, ecc, mask, modules: boolean[][] (true = dark), capacityBits, usedBits, dataCodewords }
   * Throws when the text is empty or doesn't fit version 40.
   */
  function encode(text, options) {
    options = options || {};
    var ecc = options.ecc || "L";
    if (!ECC[ecc]) throw new Error("Unknown error correction level");
    if (!text) throw new Error("Nothing to encode");
    var seg = segment(text, pickMode(text)), ver, capacity = 0, used = 0;
    for (ver = 1; ver <= 40; ver++) {
      capacity = dataCodewords(ver, ecc) * 8;
      used = segmentBits(seg, ver);
      if (used <= capacity) break;
    }
    if (ver > 40) throw new Error("Too long for a QR code");

    var bits = [], i;
    function push(value, length) { for (var b = length - 1; b >= 0; b--) bits.push((value >>> b) & 1); }
    push(MODES[seg.mode].id, 4);
    push(seg.chars, MODES[seg.mode].count[ver <= 9 ? 0 : ver <= 26 ? 1 : 2]);
    bits = bits.concat(seg.bits);
    push(0, Math.min(4, capacity - bits.length));
    push(0, (8 - (bits.length % 8)) % 8);
    for (var pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) push(pad, 8);
    var data = [];
    for (i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(""), 2));

    // split into blocks, add error correction, interleave
    var numBlocks = ECC[ecc].blocks[ver], eccLen = ECC[ecc].perBlock[ver];
    var rawCodewords = Math.floor(rawDataModules(ver) / 8);
    var numShort = numBlocks - (rawCodewords % numBlocks), shortLen = Math.floor(rawCodewords / numBlocks);
    var blocks = [], divisor = rsDivisor(eccLen), k = 0;
    for (i = 0; i < numBlocks; i++) {
      var dat = data.slice(k, k + shortLen - eccLen + (i < numShort ? 0 : 1));
      k += dat.length;
      var block = dat.concat(rsRemainder(dat, divisor));
      if (i < numShort) block.splice(shortLen - eccLen, 0, 0); // placeholder, skipped below
      blocks.push(block);
    }
    var codewords = [];
    for (i = 0; i < blocks[0].length; i++) blocks.forEach(function (block, j) {
      if (i !== shortLen - eccLen || j >= numShort) codewords.push(block[i]);
    });

    var built = build(ver, ecc, codewords, options.mask);
    return { version: ver, size: ver * 4 + 17, mode: seg.mode, ecc: ecc, mask: built.mask, modules: built.modules, capacityBits: capacity, usedBits: used, dataCodewords: data };
  }

  return { encode: encode };
})();
if (typeof module !== "undefined") module.exports = QR;
