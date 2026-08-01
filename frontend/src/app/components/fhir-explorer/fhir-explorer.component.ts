import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-fhir-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fhir-explorer.component.html'
})
export class FhirExplorerComponent implements OnInit {
  activeTab: 'query' | 'conformance' | 'ingest' = 'query';

  // Query tab state
  selectedResource = 'Patient';
  selectedResourceId = '';
  patientIdFilter = '';
  isEverythingQuery = false;
  
  // Results state
  jsonResult: string = '';
  rawResult: any = null;
  loading = false;
  errorMsg = '';
  httpStatus = 200;
  totalEntries = 0;
  copied = false;

  // Ingest tab state
  sampleIngestPayload = JSON.stringify({
    resourceType: "Patient",
    identifier: [
      { use: "official", system: "urn:oid:2.16.840.1.113883.4.1", value: "MRN-FHIR-99" },
      { use: "secondary", system: "urn:oid:2.16.840.1.113883.4.1.ssn", value: "999-00-1234" }
    ],
    name: [
      { use: "official", text: "Eleanor Vance", family: "Vance", given: ["Eleanor"] }
    ],
    gender: "female",
    birthDate: "1990-03-15",
    telecom: [
      { system: "phone", value: "+1-555-0199", use: "mobile" },
      { system: "email", value: "eleanor.vance@example.com", use: "home" }
    ],
    address: [
      { use: "home", text: "742 Evergreen Terrace, Springfield, OR" }
    ]
  }, null, 2);

  ingestStatus = '';
  ingestLoading = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.executeQuery();
  }

  setTab(tab: 'query' | 'conformance' | 'ingest') {
    this.activeTab = tab;
    if (tab === 'conformance') {
      this.loadConformance();
    }
  }

  loadConformance() {
    this.loading = true;
    this.errorMsg = '';
    this.apiService.getFhirMetadata().subscribe({
      next: (res) => {
        this.rawResult = res;
        this.jsonResult = JSON.stringify(res, null, 2);
        this.loading = false;
        this.httpStatus = 200;
        this.totalEntries = res.rest?.[0]?.resource?.length || 0;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Failed to fetch FHIR CapabilityStatement metadata';
        this.jsonResult = JSON.stringify(err.error || { status: err.status }, null, 2);
        this.httpStatus = err.status || 500;
      }
    });
  }

  executeQuery() {
    this.loading = true;
    this.errorMsg = '';
    this.jsonResult = '';
    this.rawResult = null;
    this.totalEntries = 0;

    const patientId = this.patientIdFilter ? parseInt(this.patientIdFilter, 10) : undefined;

    if (this.isEverythingQuery && patientId) {
      this.apiService.getFhirPatientEverything(patientId).subscribe({
        next: (res) => this.handleSuccess(res),
        error: (err) => this.handleError(err)
      });
      return;
    }

    if (this.selectedResourceId.trim()) {
      this.apiService.getFhirResourceById(this.selectedResource, this.selectedResourceId.trim()).subscribe({
        next: (res) => this.handleSuccess(res),
        error: (err) => this.handleError(err)
      });
      return;
    }

    this.apiService.getFhirResource(this.selectedResource, patientId).subscribe({
      next: (res) => this.handleSuccess(res),
      error: (err) => this.handleError(err)
    });
  }

  private handleSuccess(res: any) {
    this.loading = false;
    this.httpStatus = 200;
    this.rawResult = res;
    this.jsonResult = JSON.stringify(res, null, 2);
    if (res.resourceType === 'Bundle') {
      this.totalEntries = res.total ?? (res.entry ? res.entry.length : 0);
    } else {
      this.totalEntries = 1;
    }
  }

  private handleError(err: any) {
    this.loading = false;
    this.httpStatus = err.status || 500;
    this.rawResult = err.error;
    this.jsonResult = JSON.stringify(err.error || { error: 'Unknown Error' }, null, 2);
    this.errorMsg = 'FHIR Error (' + this.httpStatus + '): ' + (err.error?.issue?.[0]?.diagnostics || err.message);
  }

  copyJson() {
    navigator.clipboard.writeText(this.jsonResult);
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }

  submitIngest() {
    try {
      const payload = JSON.parse(this.sampleIngestPayload);
      this.ingestLoading = true;
      this.ingestStatus = '';

      this.apiService.createFhirPatient(payload).subscribe({
        next: (res) => {
          this.ingestLoading = false;
          this.ingestStatus = 'SUCCESS: Patient ingested into MedVault! New FHIR ID: ' + res.id;
          this.selectedResource = 'Patient';
          this.selectedResourceId = res.id;
          this.activeTab = 'query';
          this.executeQuery();
        },
        error: (err) => {
          this.ingestLoading = false;
          this.ingestStatus = 'FAILED: ' + (err.error?.issue?.[0]?.diagnostics || err.message);
        }
      });
    } catch (e: any) {
      this.ingestStatus = 'INVALID JSON: ' + e.message;
    }
  }
}
