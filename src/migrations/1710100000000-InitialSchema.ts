import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1710100000000 implements MigrationInterface {
  name = 'InitialSchema1710100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. USERS
    await queryRunner.query(`
      CREATE TABLE users (
        id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        full_name          VARCHAR(255) NOT NULL,
        phone              VARCHAR(20)  NOT NULL UNIQUE,
        email              VARCHAR(255) NOT NULL UNIQUE,
        password_hash      VARCHAR(255) NOT NULL,
        date_of_birth      DATE,
        avatar_url         VARCHAR(500),
        gender             VARCHAR(10)  NOT NULL CHECK (gender IN ('male', 'female', 'other')),
        is_email_verified  BOOLEAN      NOT NULL DEFAULT FALSE,
        verification_token VARCHAR(255),
        token_expires_at   TIMESTAMPTZ,
        created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        deleted_at         TIMESTAMPTZ
      );
    `);

    // 2. ROLES
    await queryRunner.query(`
      CREATE TABLE roles (
        id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name        VARCHAR(50) NOT NULL UNIQUE,
        description TEXT
      );
    `);

    await queryRunner.query(`
      INSERT INTO roles (name) VALUES ('shop_owner'), ('freelancer');
    `);

    // 3. USER_ROLES
    await queryRunner.query(`
      CREATE TABLE user_roles (
        id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        role_id BIGINT NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
        UNIQUE (user_id, role_id)
      );
    `);

    // 4. OWNER_PROFILES
    await queryRunner.query(`
      CREATE TABLE owner_profiles (
        id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id     BIGINT      NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
        unique_code VARCHAR(50) NOT NULL UNIQUE
      );
    `);

    // 5. FREELANCER_PROFILES
    await queryRunner.query(`
      CREATE TABLE freelancer_profiles (
        id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id      BIGINT       NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
        house_number VARCHAR(50),
        street       VARCHAR(255),
        ward         VARCHAR(255),
        district     VARCHAR(255),
        province     VARCHAR(255)
      );
    `);

    // 6. SHOPS
    await queryRunner.query(`
      CREATE TABLE shops (
        id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        owner_id     BIGINT       NOT NULL REFERENCES owner_profiles (id) ON DELETE CASCADE,
        name         VARCHAR(255) NOT NULL,
        logo_url     VARCHAR(500),
        house_number VARCHAR(50),
        street       VARCHAR(255),
        ward         VARCHAR(255),
        district     VARCHAR(255),
        province     VARCHAR(255),
        phone        VARCHAR(20),
        email        VARCHAR(255),
        created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        deleted_at   TIMESTAMPTZ
      );
    `);

    // 7. WORK_REQUESTS
    await queryRunner.query(`
      CREATE TABLE work_requests (
        id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        freelancer_id BIGINT      NOT NULL REFERENCES freelancer_profiles (id) ON DELETE CASCADE,
        shop_id       BIGINT      NOT NULL REFERENCES shops (id) ON DELETE CASCADE,
        type          VARCHAR(20) NOT NULL CHECK (type IN ('freelancer_request', 'owner_proposal')),
        status        VARCHAR(10) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 8. REFRESH_TOKENS
    await queryRunner.query(`
      CREATE TABLE refresh_tokens (
        id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id    BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        token      VARCHAR(500) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ  NOT NULL,
        revoked    BOOLEAN      NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    // 9. CONTRACTS
    await queryRunner.query(`
      CREATE TABLE contracts (
        id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        freelancer_id   BIGINT      NOT NULL REFERENCES freelancer_profiles (id) ON DELETE CASCADE,
        shop_id         BIGINT      NOT NULL REFERENCES shops (id) ON DELETE CASCADE,
        work_request_id BIGINT      NOT NULL REFERENCES work_requests (id) ON DELETE CASCADE,
        status          VARCHAR(15) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'terminated')),
        started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ended_at        TIMESTAMPTZ,
        terminated_by   BIGINT      REFERENCES users (id) ON DELETE SET NULL,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS contracts`);
    await queryRunner.query(`DROP TABLE IF EXISTS refresh_tokens`);
    await queryRunner.query(`DROP TABLE IF EXISTS work_requests`);
    await queryRunner.query(`DROP TABLE IF EXISTS shops`);
    await queryRunner.query(`DROP TABLE IF EXISTS freelancer_profiles`);
    await queryRunner.query(`DROP TABLE IF EXISTS owner_profiles`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_roles`);
    await queryRunner.query(`DROP TABLE IF EXISTS roles`);
    await queryRunner.query(`DROP TABLE IF EXISTS users`);
  }
}
