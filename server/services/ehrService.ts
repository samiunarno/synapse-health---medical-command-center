import axios from 'axios';

const FHIR_BASE_URL = 'http://hapi.fhir.org/baseR4';

export const ehrService = {
  async getPatientData(patientName: string) {
    try {
      // Fetch patient by name
      const patientRes = await axios.get(`${FHIR_BASE_URL}/Patient?name=${encodeURIComponent(patientName)}`);
      const patients = patientRes.data.entry;
      
      if (!patients || patients.length === 0) {
        return { message: 'No FHIR records found for this patient.' };
      }

      const fhirPatientId = patients[0].resource.id;

      // Fetch Observations (Vitals, Lab Results)
      const observationsRes = await axios.get(`${FHIR_BASE_URL}/Observation?patient=${fhirPatientId}&_count=5`);
      const observations = observationsRes.data.entry?.map((e: any) => e.resource) || [];

      // Fetch Conditions (Problems)
      const conditionsRes = await axios.get(`${FHIR_BASE_URL}/Condition?patient=${fhirPatientId}&_count=5`);
      const conditions = conditionsRes.data.entry?.map((e: any) => e.resource) || [];

      return {
        patient: patients[0].resource,
        observations,
        conditions
      };
    } catch (error) {
      console.error('Error fetching FHIR data:', error);
      return { error: 'Failed to fetch EHR data from FHIR server.' };
    }
  }
};
