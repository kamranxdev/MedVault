#!/usr/bin/env bash
# ==============================================================================
# MedVault Enterprise EHR - Official Synthea Synthetic Patient Generation Pipeline
# ==============================================================================
set -e

COUNT=${1:-3}
STATE=${2:-"Massachusetts"}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TOOLS_DIR="$PROJECT_ROOT/backend/tools"
JAR_PATH="$TOOLS_DIR/synthea-with-dependencies.jar"
OUTPUT_DIR="$TOOLS_DIR/output"

echo "========================================================================"
echo "🩺 MedVault Synthea Framework Synthetic Pipeline Engine"
echo "========================================================================"
echo "Population Target : $COUNT Patients"
echo "Demographic Region : $STATE"
echo "Tools Directory   : $TOOLS_DIR"
echo "========================================================================"

mkdir -p "$TOOLS_DIR"

if [ ! -f "$JAR_PATH" ]; then
    echo "⬇️ Downloading official Synthea Framework (v3.0.0)..."
    curl -L -o "$JAR_PATH" "https://github.com/synthetichealth/synthea/releases/download/v3.0.0/synthea-with-dependencies.jar"
    echo "✅ Download complete."
fi

echo "🚀 Invoking Synthea Generator Engine..."
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

java -jar "$JAR_PATH" \
    -p "$COUNT" \
    "$STATE" \
    --exporter.fhir.export=true \
    --exporter.fhir.use_us_core_ig=false \
    --exporter.base_directory="$OUTPUT_DIR"

FHIR_DIR="$OUTPUT_DIR/fhir"
if [ -d "$FHIR_DIR" ]; then
    BUNDLE_COUNT=$(find "$FHIR_DIR" -name "*.json" ! -name "*practitioner*" ! -name "*hospital*" | wc -l)
    echo "✅ Synthea CLI successfully generated $BUNDLE_COUNT FHIR R4 Patient Bundles."
else
    echo "⚠️ Synthea FHIR output directory not found."
fi

echo "========================================================================"
echo "🎉 Synthea Pipeline Execution Completed Successfully!"
echo "========================================================================"
