SELECT *, point(-73.9939, 40.7506) <@> point (longitude, latitude)::point AS distance
FROM nyc_crime_2014
/* Within a mile */
WHERE (point(-73.9939, 40.7506) <@> point(longitude, latitude)) < 1
ORDER by distance;