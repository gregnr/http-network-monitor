--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: messageexchange; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE messageexchange (
    source_ipaddress inet NOT NULL,
    destination_ipaddress inet NOT NULL,
    request_type character varying(10) NOT NULL,
    url character varying(500) NOT NULL,
    http_version character varying(10) NOT NULL,
    host character varying(100),
    user_agent character varying(500),
    request_timestamp timestamp without time zone NOT NULL,
    status_code integer NOT NULL,
    content_size integer,
    content_type character varying(50),
    content_encoding character varying(50),
    server character varying(50),
    response_timestamp timestamp without time zone NOT NULL,
    response_body_location character varying(500)
);


ALTER TABLE public.messageexchange OWNER TO postgres;

--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

