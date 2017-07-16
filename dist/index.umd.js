(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('babel-runtime/helpers/classCallCheck'), require('babel-runtime/helpers/createClass'), require('babel-runtime/helpers/slicedToArray')) :
	typeof define === 'function' && define.amd ? define(['babel-runtime/helpers/classCallCheck', 'babel-runtime/helpers/createClass', 'babel-runtime/helpers/slicedToArray'], factory) :
	(global['polyline-coordinates'] = factory(global._classCallCheck,global._createClass,global._slicedToArray));
}(this, (function (_classCallCheck,_createClass,_slicedToArray) { 'use strict';

_classCallCheck = _classCallCheck && _classCallCheck.hasOwnProperty('default') ? _classCallCheck['default'] : _classCallCheck;
_createClass = _createClass && _createClass.hasOwnProperty('default') ? _createClass['default'] : _createClass;
_slicedToArray = _slicedToArray && _slicedToArray.hasOwnProperty('default') ? _slicedToArray['default'] : _slicedToArray;

// kilometers per mile
var kiloPerMile = 1.60934;

// radius or earth in miles
var earthRadius = 3961;

var square = function square(x) {
  return x * x;
};

// rounds to the nearest thousandth digit
var round = function round(n) {
  return Math.round(n * 1000) / 1000;
};

var getEuclideanDist = function getEuclideanDist(a, b) {
  var squaredDistance = square(a[0] - b[0]) + square(a[1] - b[1]);
  return Math.sqrt(squaredDistance);
};

var degreeToRad = function degreeToRad(degree) {
  return degree * (Math.PI / 180);
};

// get the distance in miles between two coordinates
var getMileDist = function getMileDist(start, end) {
  var startInRadians = start.map(function (degree) {
    return degreeToRad(degree);
  });
  var endInRadians = end.map(function (degree) {
    return degreeToRad(degree);
  });

  var _startInRadians = _slicedToArray(startInRadians, 2),
      startLatitude = _startInRadians[0],
      startLongitude = _startInRadians[1];

  var _endInRadians = _slicedToArray(endInRadians, 2),
      endLatitude = _endInRadians[0],
      endLongitude = _endInRadians[1];

  var latitudeDelta = endLatitude - startLatitude;
  var longitudeDelta = endLongitude - startLongitude;
  var a = square(Math.sin(latitudeDelta / 2)) + Math.cos(startLatitude) * Math.cos(endLatitude) * square(Math.sin(longitudeDelta / 2));
  var c = Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 2;
  return round(earthRadius * c);
};

var milesToKm = function milesToKm(mile) {
  return mile * kiloPerMile;
};



var buildPolyline = function buildPolyline(geojson) {
  if (geojson.length === 1) {
    var _geojson = _slicedToArray(geojson, 1),
        _start = _geojson[0];

    return {
      segments: [{ start: _start, end: _start, mileDistance: 0, euclideanDistance: 0 }],
      mileLength: 0,
      euclideanLength: 0
    };
  }

  var polyline = { mileLength: 0, euclideanLength: 0, segments: [] };

  for (var i = 0; i < geojson.length - 1; i += 1) {
    var _start2 = geojson[i];
    var _end = geojson[i + 1];
    var mileDist = getMileDist(_start2, _end);
    var euclideanDist = getEuclideanDist(_start2, _end);

    polyline.segments.push({
      start: _start2,
      end: _end,
      mileDistance: mileDist,
      euclideanDistance: euclideanDist
    });

    polyline.euclideanLength += euclideanDist;
    polyline.mileLength += mileDist;
  }

  return polyline;
};

var getInterpolatedPoint = function getInterpolatedPoint(segment, segmentPercentage, offset) {
  var start = segment.start,
      end = segment.end;


  var offsetProportion = offset / segmentPercentage;

  var _start3 = _slicedToArray(start, 2),
      startLat = _start3[0],
      startLong = _start3[1];

  var _end2 = _slicedToArray(end, 2),
      endLat = _end2[0],
      endLong = _end2[1];

  var deltaX = Math.abs(endLat - startLat) * offsetProportion;
  var deltaY = Math.abs(endLong - startLong) * offsetProportion;

  var offsetX = startLat < endLat ? deltaX : -deltaX;
  var offsetY = startLong < endLong ? deltaY : -deltaY;

  return [startLat + offsetX, startLong + offsetY];
};

var linearSearcher = function linearSearcher(polyline, percent) {
  var segments = polyline.segments,
      mileLength = polyline.mileLength;

  var distanceCovered = 0;
  var percentRemaining = percent;
  var segment = segments[segments.length - 1];
  var currentPercent = 0;

  for (var i = 0; i < segments.length; i += 1) {
    distanceCovered += segments[i].mileDistance;
    currentPercent = distanceCovered / mileLength;

    if (currentPercent >= percent) {
      segment = segments[i];
      break;
    }

    percentRemaining -= currentPercent;
  }

  return getInterpolatedPoint(segment, segment.mileDistance / mileLength, percentRemaining);
};

var Polyline = function () {
  function Polyline(geojson) {
    _classCallCheck(this, Polyline);

    this.line = geojson;
    this.polyline = buildPolyline(geojson);
  }

  _createClass(Polyline, [{
    key: 'getLengthInMiles',
    value: function getLengthInMiles() {
      return this.polyline.mileLength;
    }
  }, {
    key: 'getLengthInKm',
    value: function getLengthInKm() {
      return milesToKm(this.getLengthInMiles());
    }
  }, {
    key: 'getPointAtProp',
    value: function getPointAtProp(prop) {
      return linearSearcher(this.polyline, prop);
    }
  }, {
    key: 'getPointCovering',
    value: function getPointCovering(percent) {
      return this.getPointAtProp(percent);
    }
  }], [{
    key: 'getDistanceBetweenPoints',
    value: function getDistanceBetweenPoints(start, end) {
      return getMileDist(start, end);
    }
  }, {
    key: 'getDistanceBetweenPointsKm',
    value: function getDistanceBetweenPointsKm(start, end) {
      return milesToKm(Polyline.getDistanceBetweenPoints(start, end));
    }
  }]);

  return Polyline;
}();

return Polyline;

})));
//# sourceMappingURL=index.umd.js.map
