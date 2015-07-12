--
-- PostgreSQL database dump
--

DROP TABLE messageexchange;

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
    id integer NOT NULL,
    source_device_name varchar(100),
    source_ipaddress inet NOT NULL,
    source_port integer NOT NULL,
    destination_ipaddress inet NOT NULL,
    destination_port integer NOT NULL,
    request_type character varying(10) NOT NULL,
    url character varying(500) NOT NULL,
    http_version character varying(10) NOT NULL,
    host character varying(100),
    user_agent character varying(500),
    request_timestamp timestamp without time zone NOT NULL,
    status_code integer NOT NULL,
    content_length integer,
    content_type character varying(50),
    content_encoding character varying(50),
    server character varying(50),
    response_timestamp timestamp without time zone NOT NULL,
    response_body_location character varying(500)
);


ALTER TABLE public.messageexchange OWNER TO postgres;

--
-- Name: messageexchange_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE messageexchange_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.messageexchange_id_seq OWNER TO postgres;

--
-- Name: messageexchange_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE messageexchange_id_seq OWNED BY messageexchange.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY messageexchange ALTER COLUMN id SET DEFAULT nextval('messageexchange_id_seq'::regclass);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- Name: messageexchange; Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON TABLE messageexchange FROM PUBLIC;
REVOKE ALL ON TABLE messageexchange FROM postgres;
GRANT ALL ON TABLE messageexchange TO postgres;
GRANT SELECT,INSERT ON TABLE messageexchange TO monitor;
GRANT USAGE ON SEQUENCE messageexchange_id_seq TO monitor;

--
-- PostgreSQL database dump complete
--

