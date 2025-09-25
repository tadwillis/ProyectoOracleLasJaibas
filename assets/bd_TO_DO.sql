------------------------------------------------------------------------
-- ESQUEMA DE GESTIÓN DE PROYECTOS / SPRINTS / TAREAS (Oracle)
-- Autor: tú :)
-- Nota: usa APP_USER en lugar de USER (palabra reservada)
------------------------------------------------------------------------

----------------------------
-- 1) USUARIOS
----------------------------
CREATE TABLE APP_USER (
  user_id       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username      VARCHAR2(60)  NOT NULL,
  email         VARCHAR2(150) NOT NULL,
  full_name     VARCHAR2(120),
  password_hash VARCHAR2(200) NOT NULL,
  phone         VARCHAR2(30),
  status        VARCHAR2(20)  DEFAULT 'active' NOT NULL, -- active|inactive|invited|suspended
  created_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  last_login    TIMESTAMP
);

ALTER TABLE APP_USER
  ADD CONSTRAINT uq_app_user_username UNIQUE (username);

ALTER TABLE APP_USER
  ADD CONSTRAINT uq_app_user_email UNIQUE (email);

ALTER TABLE APP_USER
  ADD CONSTRAINT ck_app_user_status
  CHECK (status IN ('active','inactive','invited','suspended'));

----------------------------
-- 2) TEAM (equipos)
----------------------------
CREATE TABLE TEAM (
  team_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        VARCHAR2(120) NOT NULL,
  description CLOB,
  created_by  NUMBER        NOT NULL, -- FK -> APP_USER
  created_at  TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

ALTER TABLE TEAM
  ADD CONSTRAINT fk_team_created_by
  FOREIGN KEY (created_by) REFERENCES APP_USER(user_id);

-- (Opcional) Nombre de equipo único:
-- ALTER TABLE TEAM ADD CONSTRAINT uq_team_name UNIQUE (name);

----------------------------
-- 3) TEAM_MEMBER (miembros del equipo)
----------------------------
CREATE TABLE TEAM_MEMBER (
  team_member_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  team_id        NUMBER   NOT NULL,
  user_id        NUMBER   NOT NULL,
  role           VARCHAR2(20) NOT NULL, -- owner|admin|member|viewer
  joined_at      TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

ALTER TABLE TEAM_MEMBER
  ADD CONSTRAINT fk_tm_team FOREIGN KEY (team_id) REFERENCES TEAM(team_id);

ALTER TABLE TEAM_MEMBER
  ADD CONSTRAINT fk_tm_user FOREIGN KEY (user_id) REFERENCES APP_USER(user_id);

ALTER TABLE TEAM_MEMBER
  ADD CONSTRAINT ck_tm_role CHECK (role IN ('owner','admin','member','viewer'));

-- Evitar duplicados del mismo usuario en el mismo equipo
ALTER TABLE TEAM_MEMBER
  ADD CONSTRAINT uq_tm_team_user UNIQUE (team_id, user_id);

-- Garantizar UN solo 'owner' por equipo (índice único con expresión)
CREATE UNIQUE INDEX uq_tm_one_owner_per_team
ON TEAM_MEMBER (CASE WHEN role = 'owner' THEN team_id END);

----------------------------
-- 4) PROJECT (proyectos) - pertenece a un TEAM
----------------------------
CREATE TABLE PROJECT (
  project_id  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  team_id     NUMBER   NOT NULL,
  name        VARCHAR2(150) NOT NULL,
  description CLOB,
  created_by  NUMBER   NOT NULL, -- FK -> APP_USER
  created_at  TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

ALTER TABLE PROJECT
  ADD CONSTRAINT fk_project_team FOREIGN KEY (team_id) REFERENCES TEAM(team_id);

ALTER TABLE PROJECT
  ADD CONSTRAINT fk_project_created_by FOREIGN KEY (created_by) REFERENCES APP_USER(user_id);

-- (Opcional) nombre único por equipo
-- CREATE UNIQUE INDEX uq_project_team_name ON PROJECT(team_id, name);

----------------------------
-- 5) SPRINT (por proyecto)
----------------------------
CREATE TABLE SPRINT (
  sprint_id  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id NUMBER   NOT NULL,
  name       VARCHAR2(120) NOT NULL,
  goal       VARCHAR2(400),
  start_date DATE,
  end_date   DATE,
  status     VARCHAR2(20) DEFAULT 'planned' NOT NULL, -- planned|active|completed|canceled
  created_by NUMBER NOT NULL,   -- FK -> APP_USER
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP
);

ALTER TABLE SPRINT
  ADD CONSTRAINT fk_sprint_project FOREIGN KEY (project_id) REFERENCES PROJECT(project_id);

ALTER TABLE SPRINT
  ADD CONSTRAINT fk_sprint_created_by FOREIGN KEY (created_by) REFERENCES APP_USER(user_id);

ALTER TABLE SPRINT
  ADD CONSTRAINT ck_sprint_status CHECK (status IN ('planned','active','completed','canceled'));

----------------------------
-- 6) USER_STORY (historias) - por TEAM
----------------------------
CREATE TABLE USER_STORY (
  story_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  team_id      NUMBER   NOT NULL,
  title        VARCHAR2(200) NOT NULL,
  description  CLOB,
  story_points NUMBER,
  priority     NUMBER,  -- 1..5
  status       VARCHAR2(20) DEFAULT 'backlog' NOT NULL, -- backlog|ready|in_sprint|done|archived
  created_by   NUMBER   NOT NULL, -- FK -> APP_USER
  created_at   TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at   TIMESTAMP
);

ALTER TABLE USER_STORY
  ADD CONSTRAINT fk_story_team FOREIGN KEY (team_id) REFERENCES TEAM(team_id);

ALTER TABLE USER_STORY
  ADD CONSTRAINT fk_story_created_by FOREIGN KEY (created_by) REFERENCES APP_USER(user_id);

ALTER TABLE USER_STORY
  ADD CONSTRAINT ck_story_priority CHECK (priority BETWEEN 1 AND 5);

ALTER TABLE USER_STORY
  ADD CONSTRAINT ck_story_status
  CHECK (status IN ('backlog','ready','in_sprint','done','archived'));

----------------------------
-- 7) TASK (tareas) - pertenece a una historia; sprint_id es opcional
----------------------------
CREATE TABLE TASK (
  task_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  story_id         NUMBER   NOT NULL,
  sprint_id        NUMBER,              -- NULLABLE
  team_id          NUMBER   NOT NULL,
  title            VARCHAR2(200) NOT NULL,
  description      CLOB,
  status           VARCHAR2(20) DEFAULT 'todo' NOT NULL, -- todo|in_progress|in_review|blocked|done
  assigned_user_id NUMBER,             -- NULLABLE -> APP_USER
  effort_hours     NUMBER,
  priority         NUMBER,             -- 1..5
  start_date       DATE,
  end_date         DATE,
  created_at       TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at       TIMESTAMP
);

ALTER TABLE TASK
  ADD CONSTRAINT fk_task_story FOREIGN KEY (story_id) REFERENCES USER_STORY(story_id);

ALTER TABLE TASK
  ADD CONSTRAINT fk_task_sprint FOREIGN KEY (sprint_id) REFERENCES SPRINT(sprint_id);

ALTER TABLE TASK
  ADD CONSTRAINT fk_task_team FOREIGN KEY (team_id) REFERENCES TEAM(team_id);

ALTER TABLE TASK
  ADD CONSTRAINT fk_task_assigned_user FOREIGN KEY (assigned_user_id) REFERENCES APP_USER(user_id);

ALTER TABLE TASK
  ADD CONSTRAINT ck_task_status
  CHECK (status IN ('todo','in_progress','in_review','blocked','done'));

ALTER TABLE TASK
  ADD CONSTRAINT ck_task_priority CHECK (priority BETWEEN 1 AND 5);

-- Índices útiles para FKs (mejoran joins/borrados)
CREATE INDEX ix_tm_user        ON TEAM_MEMBER(user_id);
CREATE INDEX ix_tm_team        ON TEAM_MEMBER(team_id);
CREATE INDEX ix_project_team   ON PROJECT(team_id);
CREATE INDEX ix_sprint_project ON SPRINT(project_id);
CREATE INDEX ix_story_team     ON USER_STORY(team_id);
CREATE INDEX ix_task_story     ON TASK(story_id);
CREATE INDEX ix_task_sprint    ON TASK(sprint_id);
CREATE INDEX ix_task_team      ON TASK(team_id);
CREATE INDEX ix_task_assignee  ON TASK(assigned_user_id);
