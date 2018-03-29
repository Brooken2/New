CREATE DATABASE goaltracker;
\c goaltracker
\dt - list the tables

CREATE TABLE public.goals
(
	id SERIAL NOT NULL PRIMARY KEY,
	goalname VARCHAR(100) NOT NULL,
	enddate VARCHAR(10) NOT NULL,
	description VARCHAR(200) NOT NULL,
	userid INT NOT NULL REFERENCES public.users(id)
);

CREATE TABLE public.users
(
	id SERIAL NOT NULL PRIMARY KEY,
	username VARCHAR(100) NOT NULL UNIQUE,
	password VARCHAR(100) NOT NULL,
	display_name VARCHAR(100) NOT NULL
);

ALTER TABLE public.users ADD COLUMN goalid INT REFERENCES public.goals(id);
ALTER TABLE public.users DROP COLUMN goalid;
ALTER TABLE public.users ALTER goalid SET NOT NULL;
ALTER TABLE public.goals ALTER usersid SET NOT NULL;
UPDATE users SET goalid = 1 WHERE id = 1;
ALTER TABLE public.goals ADD COLUMN userid  INT REFERENCES public.users(id);
UPDATE goals SET userid = 1 WHERE id = 1;

INSERT INTO users(username, password, display_name) VALUES ('Brooke', 'pass', 'Brooken2');
INSERT INTO goals(goalName, endDate, description, userid) VALUES('Goal Of Life', '2019-01-11', 'This is a test Goal to see if i can pull from Database', '1');
CREATE USER tuser WITH PASSWORD 'tpass';
GRANT SELECT, INSERT, UPDATE ON goals TO tuser;
GRANT SELECT, INSERT, UPDATE ON users TO tuser;

