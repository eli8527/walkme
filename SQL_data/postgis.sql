ALTER TABLE nyc_crime_2014 ADD COLUMN geom geometry(Point,4326);
UPDATE nyc_crime_2014 SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);