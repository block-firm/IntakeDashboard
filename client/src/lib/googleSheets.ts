import { z } from "zod";

// Define schemas for the user's specific data structure
export const ConversionRecordSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  createDate: z.string(),
  leadStatus: z.string(),
  lifecycleStage: z.string(),
  contactOwnerFirstName: z.string(),
  contactOwnerLastName: z.string(),
  dept: z.string(),
});

export type ConversionRecord = z.infer<typeof ConversionRecordSchema>;

// Employee tracking for each department
export interface EmployeeConversion {
  name: string;
  count: number;
  department: string;
}

export interface DepartmentMetrics {
  name: string;
  totalConversions: number;
  employees: EmployeeConversion[];
}

// Parse CSV data from Google Sheets
export function parseConversionsCSV(csvText: string): ConversionRecord[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const results: ConversionRecord[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const entry: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index]?.trim() || '';
      
      if (header.includes('first name')) entry.firstName = value;
      else if (header.includes('last name')) entry.lastName = value;
      else if (header.includes('create date')) entry.createDate = value;
      else if (header.includes('lead status')) entry.leadStatus = value;
      else if (header.includes('lifecycle')) entry.lifecycleStage = value;
      else if (header.includes('contact owner') && header.includes('first')) entry.contactOwnerFirstName = value;
      else if (header.includes('contact owner') && header.includes('last')) entry.contactOwnerLastName = value;
      else if (header.includes('dept')) entry.dept = value;
    });
    
    if (entry.firstName && entry.dept) {
      results.push({
        firstName: entry.firstName,
        lastName: entry.lastName || '',
        createDate: entry.createDate || '',
        leadStatus: entry.leadStatus || 'Client',
        lifecycleStage: entry.lifecycleStage || 'Client',
        contactOwnerFirstName: entry.contactOwnerFirstName || '',
        contactOwnerLastName: entry.contactOwnerLastName || '',
        dept: entry.dept
      });
    }
  }
  
  return results;
}

// Calculate department metrics and employee conversion counts
export function calculateMetrics(records: ConversionRecord[]): DepartmentMetrics[] {
  const personalInjuryEmployees = ['Juan G', 'Bryan', 'Gerardo'];
  const habitabilityEmployees = ['Juan R', 'Alfredo', 'Jessica', 'Vanessa'];
  
  const departments: { [key: string]: DepartmentMetrics } = {
    'Personal Injury': {
      name: 'Personal Injury',
      totalConversions: 0,
      employees: personalInjuryEmployees.map(name => ({ name, count: 0, department: 'Personal Injury' }))
    },
    'Habitability': {
      name: 'Habitability',
      totalConversions: 0,
      employees: habitabilityEmployees.map(name => ({ name, count: 0, department: 'Habitability' }))
    }
  };
  
  // Count conversions by department and employee
  records.forEach(record => {
    const dept = record.dept.trim();
    const ownerFirstName = record.contactOwnerFirstName.trim();
    
    if (departments[dept]) {
      departments[dept].totalConversions++;
      
      // Find matching employee
      const employee = departments[dept].employees.find(emp => 
        emp.name.toLowerCase().includes(ownerFirstName.toLowerCase())
      );
      
      if (employee) {
        employee.count++;
      }
    }
  });
  
  return Object.values(departments);
}

// Fetch data from Google Sheets
export async function fetchConversionsData(sheetId: string): Promise<ConversionRecord[]> {
  try {
    // Use the CSV export URL for the Conversions sheet
    const url = `https://docs.google.com/spreadsheets/d/e/${sheetId}/gviz/tq?tqx=out:csv&sheet=Conversions`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    
    const text = await response.text();
    return parseConversionsCSV(text);
  } catch (error) {
    console.error("Error fetching Google Sheet data:", error);
    return generateMockConversionData();
  }
}

// Generate mock data for testing
export function generateMockConversionData(): ConversionRecord[] {
  const mockData: ConversionRecord[] = [
    {
      firstName: 'Tracey',
      lastName: 'Green',
      createDate: '2025-11-15 22:39:51',
      leadStatus: 'Client',
      lifecycleStage: 'Client',
      contactOwnerFirstName: 'Juan',
      contactOwnerLastName: 'Garcia',
      dept: 'Personal Injury'
    },
    {
      firstName: 'Rosemarie',
      lastName: 'Roman',
      createDate: '2025-12-11 19:04:20',
      leadStatus: 'Client',
      lifecycleStage: 'Client',
      contactOwnerFirstName: 'Bryan',
      contactOwnerLastName: 'Esqueida',
      dept: 'Personal Injury'
    },
    {
      firstName: 'Sara',
      lastName: 'Ramos',
      createDate: '2025-12-15 11:29:00',
      leadStatus: 'Client',
      lifecycleStage: 'Client',
      contactOwnerFirstName: 'Vanessa',
      contactOwnerLastName: 'Gomez',
      dept: 'Habitability'
    },
    {
      firstName: 'Yuki',
      lastName: 'G',
      createDate: '2025-12-16 12:34:11',
      leadStatus: 'Client',
      lifecycleStage: 'Client',
      contactOwnerFirstName: 'Juan',
      contactOwnerLastName: 'Garcia',
      dept: 'Personal Injury'
    },
    {
      firstName: 'Theresa',
      lastName: 'Kantarjan',
      createDate: '2025-12-29 12:07:27',
      leadStatus: 'Client',
      lifecycleStage: 'Client',
      contactOwnerFirstName: 'Alex',
      contactOwnerLastName: 'Safarian',
      dept: 'Personal Injury'
    }
  ];
  
  return mockData;
}
