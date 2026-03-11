import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedSampleData1710200000000 implements MigrationInterface {
  name = 'SeedSampleData1710200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Pre-hash password "Password123" for all sample users
    const passwordHash = await bcrypt.hash('Password123', 10);

    // Get role IDs
    const roles = await queryRunner.query(
      `SELECT id, name FROM roles WHERE name IN ('shop_owner', 'freelancer')`,
    );
    const shopOwnerRoleId = roles.find(
      (r: { name: string }) => r.name === 'shop_owner',
    ).id;
    const freelancerRoleId = roles.find(
      (r: { name: string }) => r.name === 'freelancer',
    ).id;

    // ── 1. USERS ──────────────────────────────────────────────
    // Owner 1
    await queryRunner.query(
      `INSERT INTO users (full_name, phone, email, password_hash, date_of_birth, gender, is_email_verified)
       VALUES ('Nguyen Van A', '0901000001', 'owner1@example.com', $1, '1990-05-15', 'male', true)`,
      [passwordHash],
    );
    const [owner1User] = await queryRunner.query(
      `SELECT id FROM users WHERE email = 'owner1@example.com'`,
    );

    // Owner 2
    await queryRunner.query(
      `INSERT INTO users (full_name, phone, email, password_hash, date_of_birth, gender, is_email_verified)
       VALUES ('Tran Thi B', '0901000002', 'owner2@example.com', $1, '1988-08-20', 'female', true)`,
      [passwordHash],
    );
    const [owner2User] = await queryRunner.query(
      `SELECT id FROM users WHERE email = 'owner2@example.com'`,
    );

    // Freelancer 1
    await queryRunner.query(
      `INSERT INTO users (full_name, phone, email, password_hash, date_of_birth, gender, is_email_verified)
       VALUES ('Le Van C', '0943079414', 'freelancer1@example.com', $1, '1995-03-10', 'male', true)`,
      [passwordHash],
    );
    const [freelancer1User] = await queryRunner.query(
      `SELECT id FROM users WHERE email = 'freelancer1@example.com'`,
    );

    // Freelancer 2
    await queryRunner.query(
      `INSERT INTO users (full_name, phone, email, password_hash, date_of_birth, gender, is_email_verified)
       VALUES ('Pham Thi D', '0943079415', 'freelancer2@example.com', $1, '1997-12-25', 'female', true)`,
      [passwordHash],
    );
    const [freelancer2User] = await queryRunner.query(
      `SELECT id FROM users WHERE email = 'freelancer2@example.com'`,
    );

    // ── 2. USER_ROLES ────────────────────────────────────────
    await queryRunner.query(
      `INSERT INTO user_roles (user_id, role_id) VALUES
        ($1, $2), ($3, $4), ($5, $6), ($7, $8)`,
      [
        owner1User.id,
        shopOwnerRoleId,
        owner2User.id,
        shopOwnerRoleId,
        freelancer1User.id,
        freelancerRoleId,
        freelancer2User.id,
        freelancerRoleId,
      ],
    );

    // ── 3. OWNER_PROFILES ────────────────────────────────────
    await queryRunner.query(
      `INSERT INTO owner_profiles (user_id, unique_code) VALUES ($1, 'OWNER001'), ($2, 'OWNER002')`,
      [owner1User.id, owner2User.id],
    );
    const [ownerProfile1] = await queryRunner.query(
      `SELECT id FROM owner_profiles WHERE user_id = $1`,
      [owner1User.id],
    );
    const [ownerProfile2] = await queryRunner.query(
      `SELECT id FROM owner_profiles WHERE user_id = $1`,
      [owner2User.id],
    );

    // ── 4. FREELANCER_PROFILES ───────────────────────────────
    await queryRunner.query(
      `INSERT INTO freelancer_profiles (user_id, house_number, street, ward, district, province)
       VALUES ($1, '12', 'Nguyen Hue', 'Ben Nghe', 'Quan 1', 'Ho Chi Minh')`,
      [freelancer1User.id],
    );
    await queryRunner.query(
      `INSERT INTO freelancer_profiles (user_id, house_number, street, ward, district, province)
       VALUES ($1, '45', 'Le Loi', 'Ben Thanh', 'Quan 1', 'Ho Chi Minh')`,
      [freelancer2User.id],
    );
    const [freelancerProfile1] = await queryRunner.query(
      `SELECT id FROM freelancer_profiles WHERE user_id = $1`,
      [freelancer1User.id],
    );
    const [freelancerProfile2] = await queryRunner.query(
      `SELECT id FROM freelancer_profiles WHERE user_id = $1`,
      [freelancer2User.id],
    );

    // ── 5. SHOPS ─────────────────────────────────────────────
    // Owner 1 has 2 shops
    await queryRunner.query(
      `INSERT INTO shops (owner_id, name, logo_url, house_number, street, ward, district, province, phone, email)
       VALUES ($1, 'Quan Ca Phe Sunrise', 'https://example.com/logo1.png', '100', 'Dong Khoi', 'Ben Nghe', 'Quan 1', 'Ho Chi Minh', '02812345678', 'sunrise@example.com')`,
      [ownerProfile1.id],
    );
    await queryRunner.query(
      `INSERT INTO shops (owner_id, name, logo_url, house_number, street, ward, district, province, phone, email)
       VALUES ($1, 'Tiem Banh Moon', 'https://example.com/logo2.png', '55', 'Hai Ba Trung', 'Da Kao', 'Quan 1', 'Ho Chi Minh', '02887654321', 'moon@example.com')`,
      [ownerProfile1.id],
    );

    // Owner 2 has 1 shop
    await queryRunner.query(
      `INSERT INTO shops (owner_id, name, logo_url, house_number, street, ward, district, province, phone, email)
       VALUES ($1, 'Nha Hang Pho Viet', 'https://example.com/logo3.png', '200', 'Pham Ngu Lao', 'Pham Ngu Lao', 'Quan 1', 'Ho Chi Minh', '02811223344', 'phoviet@example.com')`,
      [ownerProfile2.id],
    );

    const shops = await queryRunner.query(
      `SELECT id, name FROM shops ORDER BY id`,
    );
    const shop1 = shops[0]; // Sunrise - owner 1
    const shop2 = shops[1]; // Moon - owner 1
    const shop3 = shops[2]; // Pho Viet - owner 2

    // ── 6. WORK_REQUESTS ─────────────────────────────────────
    // WR1: Freelancer 1 → Shop 1 (accepted → will create contract)
    await queryRunner.query(
      `INSERT INTO work_requests (freelancer_id, shop_id, type, status)
       VALUES ($1, $2, 'freelancer_request', 'accepted')`,
      [freelancerProfile1.id, shop1.id],
    );

    // WR2: Owner 1 proposes Freelancer 2 → Shop 2 (accepted → will create contract)
    await queryRunner.query(
      `INSERT INTO work_requests (freelancer_id, shop_id, type, status)
       VALUES ($1, $2, 'owner_proposal', 'accepted')`,
      [freelancerProfile2.id, shop2.id],
    );

    // WR3: Freelancer 2 → Shop 3 (pending)
    await queryRunner.query(
      `INSERT INTO work_requests (freelancer_id, shop_id, type, status)
       VALUES ($1, $2, 'freelancer_request', 'pending')`,
      [freelancerProfile2.id, shop3.id],
    );

    // WR4: Owner 2 proposes Freelancer 1 → Shop 3 (rejected)
    await queryRunner.query(
      `INSERT INTO work_requests (freelancer_id, shop_id, type, status)
       VALUES ($1, $2, 'owner_proposal', 'rejected')`,
      [freelancerProfile1.id, shop3.id],
    );

    // WR5: Freelancer 1 → Shop 2 (pending)
    await queryRunner.query(
      `INSERT INTO work_requests (freelancer_id, shop_id, type, status)
       VALUES ($1, $2, 'freelancer_request', 'pending')`,
      [freelancerProfile1.id, shop2.id],
    );

    const workRequests = await queryRunner.query(
      `SELECT id FROM work_requests WHERE status = 'accepted' ORDER BY id`,
    );

    // ── 7. CONTRACTS ─────────────────────────────────────────
    // Contract from WR1: Freelancer 1 works at Shop 1 (active)
    await queryRunner.query(
      `INSERT INTO contracts (freelancer_id, shop_id, work_request_id, status, started_at)
       VALUES ($1, $2, $3, 'active', NOW() - INTERVAL '30 days')`,
      [freelancerProfile1.id, shop1.id, workRequests[0].id],
    );

    // Contract from WR2: Freelancer 2 works at Shop 2 (active)
    await queryRunner.query(
      `INSERT INTO contracts (freelancer_id, shop_id, work_request_id, status, started_at)
       VALUES ($1, $2, $3, 'active', NOW() - INTERVAL '15 days')`,
      [freelancerProfile2.id, shop2.id, workRequests[1].id],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete in reverse dependency order
    await queryRunner.query(`DELETE FROM contracts`);
    await queryRunner.query(`DELETE FROM work_requests`);
    await queryRunner.query(`DELETE FROM shops`);
    await queryRunner.query(`DELETE FROM freelancer_profiles`);
    await queryRunner.query(`DELETE FROM owner_profiles`);
    await queryRunner.query(`DELETE FROM user_roles`);
    await queryRunner.query(
      `DELETE FROM users WHERE email IN ('owner1@example.com', 'owner2@example.com', 'freelancer1@example.com', 'freelancer2@example.com')`,
    );
  }
}
