import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1791865486524 implements MigrationInterface {
    name = 'InitialSchema1791865486524'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`services\` (\`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT, \`name\` varchar(150) NOT NULL, \`description\` text NULL, \`price\` decimal(12,2) NOT NULL DEFAULT '0.00', \`duration_minutes\` int UNSIGNED NOT NULL DEFAULT '30', \`is_active\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`staff_services\` (\`user_id\` bigint UNSIGNED NOT NULL, \`service_id\` bigint UNSIGNED NOT NULL, PRIMARY KEY (\`user_id\`, \`service_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`appointment_logs\` (\`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT, \`appointment_id\` bigint UNSIGNED NOT NULL, \`action\` varchar(50) NOT NULL, \`note\` text NULL, \`created_by\` bigint UNSIGNED NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT, \`email\` varchar(150) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`full_name\` varchar(100) NOT NULL, \`phone\` varchar(20) NULL, \`role\` enum ('ADMIN', 'STAFF') NOT NULL DEFAULT 'STAFF', \`is_active\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`appointments\` (\`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT, \`customer_id\` bigint UNSIGNED NOT NULL, \`staff_id\` bigint UNSIGNED NOT NULL, \`service_id\` bigint UNSIGNED NOT NULL, \`start_time\` datetime NOT NULL, \`end_time\` datetime NOT NULL, \`status\` enum ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED', 'NO_SHOW') NOT NULL DEFAULT 'PENDING', \`price\` decimal(12,2) NOT NULL DEFAULT '0.00', \`notes\` varchar(500) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`idx_customer_appointments\` (\`customer_id\`, \`start_time\`), INDEX \`idx_status_start_time\` (\`status\`, \`start_time\`), INDEX \`idx_staff_schedule\` (\`staff_id\`, \`start_time\`, \`end_time\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`customers\` (\`id\` bigint UNSIGNED NOT NULL AUTO_INCREMENT, \`full_name\` varchar(100) NOT NULL, \`phone\` varchar(20) NOT NULL, \`email\` varchar(150) NULL, \`gender\` enum ('MALE', 'FEMALE', 'OTHER') NOT NULL DEFAULT 'OTHER', \`dob\` date NULL, \`notes\` text NULL, \`total_spent\` decimal(12,2) NOT NULL DEFAULT '0.00', \`visit_count\` int UNSIGNED NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`idx_customers_name\` (\`full_name\`), INDEX \`idx_customers_phone\` (\`phone\`), UNIQUE INDEX \`IDX_88acd889fbe17d0e16cc4bc917\` (\`phone\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`staff_services\` ADD CONSTRAINT \`FK_807b0f434948cd9f12f2b21e890\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`staff_services\` ADD CONSTRAINT \`FK_9c320b3170bb98885902ff9ef85\` FOREIGN KEY (\`service_id\`) REFERENCES \`services\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`appointment_logs\` ADD CONSTRAINT \`FK_b73bf9621ac547a1d6005178520\` FOREIGN KEY (\`appointment_id\`) REFERENCES \`appointments\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`appointment_logs\` ADD CONSTRAINT \`FK_05e78d3539d6d946cea5fbfdb40\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`appointments\` ADD CONSTRAINT \`FK_2be3c78815aba227af1c3e8e413\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`appointments\` ADD CONSTRAINT \`FK_d211f77ba4a4f32903f0fb73a75\` FOREIGN KEY (\`staff_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`appointments\` ADD CONSTRAINT \`FK_2a2088e8eaa8f28d8de2bdbb857\` FOREIGN KEY (\`service_id\`) REFERENCES \`services\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`appointments\` DROP FOREIGN KEY \`FK_2a2088e8eaa8f28d8de2bdbb857\``);
        await queryRunner.query(`ALTER TABLE \`appointments\` DROP FOREIGN KEY \`FK_d211f77ba4a4f32903f0fb73a75\``);
        await queryRunner.query(`ALTER TABLE \`appointments\` DROP FOREIGN KEY \`FK_2be3c78815aba227af1c3e8e413\``);
        await queryRunner.query(`ALTER TABLE \`appointment_logs\` DROP FOREIGN KEY \`FK_05e78d3539d6d946cea5fbfdb40\``);
        await queryRunner.query(`ALTER TABLE \`appointment_logs\` DROP FOREIGN KEY \`FK_b73bf9621ac547a1d6005178520\``);
        await queryRunner.query(`ALTER TABLE \`staff_services\` DROP FOREIGN KEY \`FK_9c320b3170bb98885902ff9ef85\``);
        await queryRunner.query(`ALTER TABLE \`staff_services\` DROP FOREIGN KEY \`FK_807b0f434948cd9f12f2b21e890\``);
        await queryRunner.query(`DROP INDEX \`IDX_88acd889fbe17d0e16cc4bc917\` ON \`customers\``);
        await queryRunner.query(`DROP INDEX \`idx_customers_phone\` ON \`customers\``);
        await queryRunner.query(`DROP INDEX \`idx_customers_name\` ON \`customers\``);
        await queryRunner.query(`DROP TABLE \`customers\``);
        await queryRunner.query(`DROP INDEX \`idx_staff_schedule\` ON \`appointments\``);
        await queryRunner.query(`DROP INDEX \`idx_status_start_time\` ON \`appointments\``);
        await queryRunner.query(`DROP INDEX \`idx_customer_appointments\` ON \`appointments\``);
        await queryRunner.query(`DROP TABLE \`appointments\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`appointment_logs\``);
        await queryRunner.query(`DROP TABLE \`staff_services\``);
        await queryRunner.query(`DROP TABLE \`services\``);
    }

}
