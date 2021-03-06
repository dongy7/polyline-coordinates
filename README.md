# Polyline
[![Build Status](https://travis-ci.org/dongy7/Polyline.svg?branch=master)](https://travis-ci.org/dongy7/Polyline)
[![npm version](https://badge.fury.io/js/polyline-coordinates.svg)](https://badge.fury.io/js/polyline-coordinates)
[![codecov](https://codecov.io/gh/dongy7/Polyline/branch/master/graph/badge.svg)](https://codecov.io/gh/dongy7/Polyline)

Simple utility library for dealing with JSON polylines

## Installation

To use with a module bundler like [webpack](https://webpack.js.org/):
```
npm install --save polyline-coordinates
```

## Usage
```js
const Polyline = require('polyline-coordinates');

// the polyline needs to be an array of [latitude, longitude] values
const polyline = Polyline.createLine([[34.028337, -118.259954], [37.773566, -122.412786]])

polyline.getLengthInMiles()
// 347.618 miles

polyline.getLengthInKm()
// 559.43555212 km

polyline.getPointCovering(0.5);
// [35.91355, 120.33155]
```

## API

#### Polyline.createLine(geojson)
Creates a new polyline instance with the json representation of a polyline.

#### Polyline.getDistanceBetweenPoints(start, end)
Returns the distance in miles between two coordinates.

#### Polyline.getDistanceBetweenPointsKm(start, end)
Returns the distance in kilometers between two coordinates.

#### .getLengthInMiles()
Returns the total distance covered by the polyline in miles.

#### .getLengthInKm()
Returns the total distance covered by the polyline in kilometers.

#### .getPointCovering(percent)
Returns the coordinate of the point that covers the percentage of the
polyline specified.

For example `.getPointCovering(0.5)` will return the coordinates of the point
that is located in the middle of the polyline.
