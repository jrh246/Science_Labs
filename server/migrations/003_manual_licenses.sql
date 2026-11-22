ALTER TABLE organizations ADD COLUMN license_plan text CHECK(license_plan IN ('teacher','school'));
ALTER TABLE organizations ADD COLUMN license_seat_limit integer CHECK(license_seat_limit BETWEEN 1 AND 10000);
