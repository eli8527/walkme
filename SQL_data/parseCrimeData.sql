
/* Parses..csv file with information about crimes - each "data point" includes the longitude/latitude location,
type of crime, the number of crimes of the type, and the month/year in which they ocurred. 
Creates a table called nyc_crime_2014 of all crime data. */

CREATE TABLE "nyc_crime_2014"
(
	longitude double precision,
	latitude double precision,
	YR int,
	MO int,
	X int,
	Y int,
	TOT int,
	CR char(100)
);

COPY "nyc_crime_2014" (longitude, latitude, YR, MO, X, Y, TOT, CR) FROM 'C:\Users\CCHEN\Desktop\Princeton Junior\COS 333\Project\data\nyc_2014.csv' HEADER DELIMITER ',' CSV;

ALTER TABLE "nyc_crime_2014" ADD COLUMN id BIGSERIAL PRIMARY KEY;