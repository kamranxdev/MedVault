#!/usr/bin/env bash
# ==============================================================================
# MedVault EHR — On-Demand CLI Database Seeder Runner
# Executes DataSeeder to populate roles, users, patients, encounters & vitals
# ==============================================================================

echo "======================================================================"
echo "  MedVault EHR CLI Data Seeder Tool"
echo "======================================================================"
echo "Triggering on-demand database seeding..."

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

./mvnw spring-boot:run -Dspring-boot.run.arguments="--medvault.seed.enabled=true"
