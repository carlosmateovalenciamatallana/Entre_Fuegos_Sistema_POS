--
-- PostgreSQL database dump
--

\restrict qVzvwtUXCdqQFtA4XMQBT9Xu7BGuaVOfzwCgVrR0ycWYeLnZT52EIkmeiXDRwxV

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id integer NOT NULL,
    status text DEFAULT 'PENDIENTE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" integer NOT NULL,
    "tableId" integer NOT NULL
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItem" (
    id integer NOT NULL,
    quantity integer NOT NULL,
    notes text,
    "orderId" integer NOT NULL,
    "productId" integer NOT NULL,
    "cookStatus" text DEFAULT 'PENDIENTE'::text NOT NULL
);


ALTER TABLE public."OrderItem" OWNER TO postgres;

--
-- Name: OrderItem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."OrderItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."OrderItem_id_seq" OWNER TO postgres;

--
-- Name: OrderItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."OrderItem_id_seq" OWNED BY public."OrderItem".id;


--
-- Name: Order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Order_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Order_id_seq" OWNER TO postgres;

--
-- Name: Order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Order_id_seq" OWNED BY public."Order".id;


--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id integer NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    price double precision NOT NULL
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: Product_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Product_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Product_id_seq" OWNER TO postgres;

--
-- Name: Product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Product_id_seq" OWNED BY public."Product".id;


--
-- Name: Table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Table" (
    id integer NOT NULL,
    number integer NOT NULL,
    capacity integer DEFAULT 4 NOT NULL,
    status text DEFAULT 'libre'::text NOT NULL,
    x integer DEFAULT 0 NOT NULL,
    y integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Table" OWNER TO postgres;

--
-- Name: Table_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Table_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Table_id_seq" OWNER TO postgres;

--
-- Name: Table_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Table_id_seq" OWNED BY public."Table".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    name text NOT NULL,
    role text DEFAULT 'MESERO'::text NOT NULL,
    pin text NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: Waitlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Waitlist" (
    id integer NOT NULL,
    name text NOT NULL,
    "partySize" integer NOT NULL,
    phone text,
    status text DEFAULT 'WAITING'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Waitlist" OWNER TO postgres;

--
-- Name: Waitlist_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Waitlist_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Waitlist_id_seq" OWNER TO postgres;

--
-- Name: Waitlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Waitlist_id_seq" OWNED BY public."Waitlist".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Order id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order" ALTER COLUMN id SET DEFAULT nextval('public."Order_id_seq"'::regclass);


--
-- Name: OrderItem id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem" ALTER COLUMN id SET DEFAULT nextval('public."OrderItem_id_seq"'::regclass);


--
-- Name: Product id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product" ALTER COLUMN id SET DEFAULT nextval('public."Product_id_seq"'::regclass);


--
-- Name: Table id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Table" ALTER COLUMN id SET DEFAULT nextval('public."Table_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: Waitlist id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Waitlist" ALTER COLUMN id SET DEFAULT nextval('public."Waitlist_id_seq"'::regclass);


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, status, "createdAt", "userId", "tableId") FROM stdin;
4	COMPLETADA	2026-03-10 00:46:08.952	1	1
1	COMPLETADA	2026-03-09 23:09:19.099	1	5
2	COMPLETADA	2026-03-09 23:16:46.261	1	4
3	COMPLETADA	2026-03-09 23:17:49.531	3	7
5	COMPLETADA	2026-03-10 00:50:49.953	1	1
6	COMPLETADA	2026-03-10 00:57:08.423	2	2
7	COMPLETADA	2026-03-10 01:00:45.899	2	4
8	COMPLETADA	2026-03-10 01:01:42.28	2	8
10	COMPLETADA	2026-03-10 01:05:35.131	1	8
9	COMPLETADA	2026-03-10 01:05:22.729	2	1
13	COMPLETADA	2026-03-10 01:10:51.688	2	13
14	COMPLETADA	2026-03-10 01:11:04.969	1	8
11	COMPLETADA	2026-03-10 01:10:29.156	1	2
12	COMPLETADA	2026-03-10 01:10:36.505	1	14
17	COMPLETADA	2026-03-10 01:16:55.161	3	12
15	COMPLETADA	2026-03-10 01:16:37.094	1	2
16	COMPLETADA	2026-03-10 01:16:45.889	2	8
18	COMPLETADA	2026-03-10 01:19:49.534	2	7
19	COMPLETADA	2026-03-10 01:39:43.374	2	4
20	COMPLETADA	2026-03-10 01:43:08.53	2	4
25	COMPLETADA	2026-03-10 01:51:25.045	3	9
27	COMPLETADA	2026-03-10 02:32:10.771	1	1
28	COMPLETADA	2026-03-10 02:32:42.049	1	4
29	COMPLETADA	2026-03-10 02:34:44.958	2	2
30	COMPLETADA	2026-03-10 02:42:18.957	2	13
31	COMPLETADA	2026-03-10 18:41:06.295	2	7
32	COMPLETADA	2026-03-10 20:00:24.974	2	4
33	COMPLETADA	2026-03-14 14:56:16.685	2	3
34	COMPLETADA	2026-03-14 16:15:51.592	2	4
35	COMPLETADA	2026-03-17 23:26:18.827	2	1
36	COMPLETADA	2026-09-26 01:24:06.636	3	2
37	COMPLETADA	2026-09-26 01:42:50.401	3	20
38	COMPLETADA	2026-09-26 03:05:30.257	3	1
39	COMPLETADA	2026-09-26 04:11:24.599	3	22
40	COMPLETADA	2026-09-26 15:12:48.087	3	8
41	COMPLETADA	2026-09-26 15:42:58.587	3	1
42	COMPLETADA	2026-09-26 15:57:34.609	3	1
43	PENDIENTE	2026-09-26 16:00:53.872	3	2
44	COMPLETADA	2026-09-27 03:59:09.014	3	3
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItem" (id, quantity, notes, "orderId", "productId", "cookStatus") FROM stdin;
1	1		1	2	PENDIENTE
2	1		1	4	PENDIENTE
3	1		2	2	PENDIENTE
4	1		3	4	PENDIENTE
5	1		4	7	PENDIENTE
6	1		5	1	PENDIENTE
8	1		5	9	PENDIENTE
9	1		6	3	PENDIENTE
10	1	termino medio	6	33	PENDIENTE
12	1		7	5	PENDIENTE
13	1		8	6	PENDIENTE
14	1		9	6	PENDIENTE
15	1		9	2	PENDIENTE
16	1		10	9	PENDIENTE
17	1		10	41	PENDIENTE
18	1		11	12	PENDIENTE
19	1		11	9	PENDIENTE
20	1		11	3	PENDIENTE
21	1		11	41	PENDIENTE
22	1		12	6	PENDIENTE
23	1		12	2	PENDIENTE
24	1		12	5	PENDIENTE
25	1		13	12	PENDIENTE
26	1		14	9	PENDIENTE
27	1		14	44	PENDIENTE
28	1		15	12	PENDIENTE
29	1		15	6	PENDIENTE
30	1		16	6	PENDIENTE
31	1		16	9	PENDIENTE
32	1		16	8	PENDIENTE
33	1		17	12	PENDIENTE
34	1		18	9	PENDIENTE
41	1		25	39	PENDIENTE
42	1		25	60	PENDIENTE
44	2		27	3	PENDIENTE
45	1		28	3	PENDIENTE
46	1		29	2	PENDIENTE
47	1		30	11	PENDIENTE
48	1		30	43	PENDIENTE
49	1		30	50	PENDIENTE
50	1		30	47	PENDIENTE
51	1		31	9	PENDIENTE
52	1		32	1	PENDIENTE
53	1		33	28	PENDIENTE
54	1		34	2	PENDIENTE
55	1		35	20	PENDIENTE
56	1	Sin sal	36	1	PENDIENTE
57	1		36	3	PENDIENTE
58	2	Sin azucar	37	45	PENDIENTE
60	1		38	1	PENDIENTE
61	1		39	2	LISTO
62	1		40	1	LISTO
63	1		41	5	LISTO
64	1		41	6	LISTO
65	1	Sin cebolla	42	1	PENDIENTE
66	1		43	2	LISTO
67	1		44	48	PENDIENTE
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, name, category, price) FROM stdin;
1	Papas Cheese Bacon	Entradas	31000
2	Montadito de Ropa Vieja	Entradas	31000
3	Chunchulla Asada o Frita	Entradas	35000
4	Chorizos	Entradas	35000
5	Canasta Chicharrones	Entradas	31000
6	Ceviche de Chicharrón	Entradas	35000
7	Ensalada Cesar	Ensaladas	36000
8	Picada 2 Personas	Picadas	69000
9	Picada 4 Personas	Picadas	98000
10	Parrillada Por Persona	Parrillada	61000
11	Tomahawk	Carnes de Res	110000
12	Solomo Tinto	Carnes de Res	70000
13	Solomillo	Carnes de Res	62000
14	T-Bone	Carnes de Res	87000
15	Churrasco	Carnes de Res	59000
16	Punta de Anca	Carnes de Res	59000
17	Bife de Chorizo	Carnes de Res	59000
18	Entraña	Carnes de Res	75000
19	Brocheta de Res	Carnes de Res	38000
20	Brocheta de Cerdo	Carnes de Cerdo	38000
21	Ribs Jack's	Carnes de Cerdo	61000
22	Ribs BBQ	Carnes de Cerdo	59000
23	Cerdo en Champignones	Carnes de Cerdo	55000
24	Milanesa de Cerdo	Carnes de Cerdo	49000
25	Carne de Cerdo a la Parrilla	Carnes de Cerdo	47000
26	Brocheta de Pollo	Pollo	37000
27	Suprema de Pollo a la Parrilla	Pollo	47000
28	Suprema de Pollo en Champignones	Pollo	54000
29	Milanesa de Pollo	Pollo	49000
30	Alitas Marinadas 6 unidades	Pollo	28000
31	Alitas Marinadas 12 unidades	Pollo	45000
32	Spaguetti Bolognesa	Pasta	42000
33	Spaguetti Carbonara	Pasta	42000
34	Fetuccini Bolognesa	Pasta	42000
35	Fetuccini Carbonara	Pasta	42000
36	Menú Infantil Spaguetti Carbonara	Infantil	34000
37	Menú Infantil Spaguetti Bolognesa	Infantil	34000
38	Menú Infantil Nuggest	Infantil	34000
39	Hamburguesa Especias Entre Fuegos	Hamburguesas	34000
40	Hamburguesa Tribeka	Hamburguesas	37000
41	Hamburguesa Chicken Buffalo	Hamburguesas	34000
42	Milanesa Napolitana	Milanesas	55000
43	Milanesa Americana	Milanesas	55000
44	Milanesa a Caballo	Milanesas	55000
45	Jugos Naturales en Agua	Bebidas	11000
46	Jugos Naturales en Leche	Bebidas	12000
47	Limonada Natural	Bebidas	8500
48	Limonada Hierba Buena	Bebidas	10500
49	Limonada de Coco	Bebidas	12800
50	Limonada de Frutos Rojos	Bebidas	12800
51	Limonada de Mango Biche	Bebidas	12800
52	Limonada de Maracuya	Bebidas	12800
53	Gaseosas	Bebidas	8000
54	Heineken	Bebidas	12800
55	Club Colombia	Bebidas	11000
56	3 Cordilleras Rosa	Bebidas	14000
57	Soda Frutos Amarillos	Bebidas	15000
58	Soda Frutos Rojos	Bebidas	15000
59	Vino Merlot (Botella)	Vinos	140000
60	Vino Merlot (Copa)	Vinos	27000
61	Vino Malbec (Botella)	Vinos	140000
62	Vino Malbec (Copa)	Vinos	27000
63	Vino Cabernet Sauvignion Reserva (Botella)	Vinos	140000
64	Vino Cabernet Sauvignion Reserva (Copa)	Vinos	27000
65	Vino Reserva (Botella)	Vinos	180000
66	Vino Reserva (Copa)	Vinos	27000
67	Ron Viejo de Caldas 5 Años (Botella)	Licores	170000
68	Ron Viejo de Caldas 5 Años (Media)	Licores	110000
69	Ron Viejo de Caldas 5 Años (Vaso)	Licores	25000
70	Aguardiente Amarillo (Botella)	Licores	150000
71	Aguardiente Amarillo (Media)	Licores	90000
72	Aguardiente Amarillo (Vaso)	Licores	25000
73	Aguardiente Cristal (Botella)	Licores	150000
74	Aguardiente Cristal (Media)	Licores	90000
75	Aguardiente Cristal (Vaso)	Licores	25000
\.


--
-- Data for Name: Table; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Table" (id, number, capacity, status, x, y) FROM stdin;
4	4	4	libre	15	80
20	20	2	libre	92	60
22	22	2	libre	92	90
8	8	4	libre	35	80
1	1	4	libre	15	20
2	2	4	ocupada	15	40
10	10	4	libre	55	60
11	11	4	libre	55	10
3	3	4	libre	15	60
14	14	4	libre	75	40
15	15	4	libre	75	60
16	16	4	libre	75	80
12	12	4	libre	55	90
17	17	4	libre	92	15
18	18	4	libre	92	30
19	19	4	libre	92	45
21	21	2	libre	92	75
5	5	4	libre	35	20
6	6	4	libre	35	40
9	9	4	libre	55	30
13	13	4	libre	75	20
7	7	4	libre	35	60
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, role, pin) FROM stdin;
5	Mateo	ADMIN	2001
1	Jacobo	MESERO	1010
2	Andrea	MESERO	1111
3	Alejandra	MESERO	1212
4	Yuli	ADMIN	0000
6	Equipo Cocina	COCINA	8888
\.


--
-- Data for Name: Waitlist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Waitlist" (id, name, "partySize", phone, status, "createdAt") FROM stdin;
1	Familia pérez	4	3238038230	SEATED	2026-09-26 04:10:53.71
2	Mateo	1	3206430013	SEATED	2026-09-26 04:12:56.462
3	Mateo	1	3238038230	SEATED	2026-09-26 04:14:40.486
5	mariana	3	3238038230	WAITING	2026-09-26 04:23:55.845
6	Pedro	1		WAITING	2026-09-26 04:26:15.553
4	mateo	1		SEATED	2026-09-26 04:22:21.419
7	Pedro	5	3238038230	WAITING	2026-09-27 04:35:52.452
8	Pedro	4	3238038230	SEATED	2026-09-27 04:37:49.757
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
8f913e09-e837-4b64-b0b1-3a96e66aa689	f6e831aec845bfad534c10bbcb35eb394801f3772875d8634cac324930561a2a	2026-03-07 10:48:13.721859-05	20260307154813_init	\N	\N	2026-03-07 10:48:13.650614-05	1
001e38b3-63bf-4084-8907-720dd54b8e49	0d3187520a306a164d8bcf162d597a3b49dadc2c192d4b82ba1a5d7c70fe8ff0	2026-03-08 22:44:25.093588-05	20260309034425_agregar_campos_mapa_mesas	\N	\N	2026-03-08 22:44:25.026064-05	1
\.


--
-- Name: OrderItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OrderItem_id_seq"', 67, true);


--
-- Name: Order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Order_id_seq"', 44, true);


--
-- Name: Product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Product_id_seq"', 75, true);


--
-- Name: Table_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Table_id_seq"', 22, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 6, true);


--
-- Name: Waitlist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Waitlist_id_seq"', 8, true);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Table Table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Table"
    ADD CONSTRAINT "Table_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Waitlist Waitlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Waitlist"
    ADD CONSTRAINT "Waitlist_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Table_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Table_number_key" ON public."Table" USING btree (number);


--
-- Name: User_pin_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_pin_key" ON public."User" USING btree (pin);


--
-- Name: OrderItem OrderItem_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_tableId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES public."Table"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict qVzvwtUXCdqQFtA4XMQBT9Xu7BGuaVOfzwCgVrR0ycWYeLnZT52EIkmeiXDRwxV

