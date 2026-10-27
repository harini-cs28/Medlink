/**
 * MEDLINK - Central Pharmacy & Inventory State Store
 * Provides persistent, reactive inventory, batch, FEFO calculation,
 * and dispensing transactions across all three roles.
 */

export interface BatchItem {
  id: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  currentStock: number;
  manufacturingDate: string;
  expiryDate: string;
  daysToExpiry: number;
  unitCost: number;
  supplierName: string;
  isFefoFirst?: boolean;
}

export interface MedicineItem {
  id: string;
  name: string;
  genericName: string;
  brandName: string;
  category: string;
  atcCode: string;
  dosageForm: string;
  totalStock: number;
  dailyDemand: number;
  reorderLevel: number;
  shortageRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  expiryRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;
  batches: BatchItem[];
}

export interface DispenseTransaction {
  id: string;
  transactionId: string;
  medicineId: string;
  medicineName: string;
  batchId: string;
  batchNumber: string;
  quantity: number;
  dispensedBy: string;
  patientId?: string;
  department?: string;
  timestamp: string;
  status: 'COMPLETED' | 'CANCELLED';
}

export interface SystemAlert {
  id: string;
  type: 'SHORTAGE' | 'EXPIRY' | 'SUPPLIER' | 'EMERGENCY_REQUEST';
  severity: 'HIGH' | 'WARNING' | 'NORMAL';
  title: string;
  description: string;
  timestamp: string;
  department?: string;
  isResolved?: boolean;
}

const INITIAL_MEDICINES: MedicineItem[] = [
  {
    id: 'med-1',
    name: 'Paracetamol 500mg',
    genericName: 'Acetaminophen',
    brandName: 'Panadol / Calpol',
    category: 'Analgesics & Antipyretics',
    atcCode: 'N02BE01',
    dosageForm: 'Tablet',
    totalStock: 775,
    dailyDemand: 142,
    reorderLevel: 500,
    shortageRisk: 'HIGH',
    expiryRisk: 'LOW',
    recommendedAction: 'Increase Reorder',
    batches: [
      {
        id: 'bth-2401',
        medicineId: 'med-1',
        medicineName: 'Paracetamol 500mg',
        batchNumber: 'BTH-2401',
        currentStock: 120,
        manufacturingDate: '2025-01-10',
        expiryDate: '2026-12-18',
        daysToExpiry: 71,
        unitCost: 0.12,
        supplierName: 'Apex Pharma Ltd',
        isFefoFirst: true,
      },
      {
        id: 'bth-2407',
        medicineId: 'med-1',
        medicineName: 'Paracetamol 500mg',
        batchNumber: 'BTH-2407',
        currentStock: 655,
        manufacturingDate: '2025-06-15',
        expiryDate: '2027-02-03',
        daysToExpiry: 118,
        unitCost: 0.11,
        supplierName: 'Apex Pharma Ltd',
        isFefoFirst: false,
      },
    ],
  },
  {
    id: 'med-2',
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin Trihydrate',
    brandName: 'Amoxil',
    category: 'Antibiotics (Penicillins)',
    atcCode: 'J01CA04',
    dosageForm: 'Capsule',
    totalStock: 300,
    dailyDemand: 48,
    reorderLevel: 250,
    shortageRisk: 'LOW',
    expiryRisk: 'MEDIUM',
    recommendedAction: 'Monitor',
    batches: [
      {
        id: 'bth-amx-01',
        medicineId: 'med-2',
        medicineName: 'Amoxicillin 500mg',
        batchNumber: 'BTH-AMX-89',
        currentStock: 110,
        manufacturingDate: '2024-11-20',
        expiryDate: '2026-11-15',
        daysToExpiry: 38,
        unitCost: 0.45,
        supplierName: 'MedPharm Global',
        isFefoFirst: true,
      },
      {
        id: 'bth-amx-02',
        medicineId: 'med-2',
        medicineName: 'Amoxicillin 500mg',
        batchNumber: 'BTH-AMX-94',
        currentStock: 190,
        manufacturingDate: '2025-04-10',
        expiryDate: '2027-05-20',
        daysToExpiry: 224,
        unitCost: 0.44,
        supplierName: 'MedPharm Global',
        isFefoFirst: false,
      },
    ],
  },
  {
    id: 'med-3',
    name: 'Ibuprofen 400mg',
    genericName: 'Ibuprofen',
    brandName: 'Advil / Brufen',
    category: 'NSAIDs & Anti-inflammatory',
    atcCode: 'M01AE01',
    dosageForm: 'Film-coated Tablet',
    totalStock: 120,
    dailyDemand: 95,
    reorderLevel: 300,
    shortageRisk: 'HIGH',
    expiryRisk: 'HIGH',
    recommendedAction: 'Urgent Review',
    batches: [
      {
        id: 'bth-ibu-01',
        medicineId: 'med-3',
        medicineName: 'Ibuprofen 400mg',
        batchNumber: 'BTH-IBU-42',
        currentStock: 120,
        manufacturingDate: '2024-10-05',
        expiryDate: '2026-10-30',
        daysToExpiry: 22,
        unitCost: 0.28,
        supplierName: 'Novis Health',
        isFefoFirst: true,
      },
    ],
  },
  {
    id: 'med-4',
    name: 'Cefixime 200mg',
    genericName: 'Cefixime',
    brandName: 'Suprax',
    category: 'Cephalosporin Antibiotics',
    atcCode: 'J01DD08',
    dosageForm: 'Tablet',
    totalStock: 450,
    dailyDemand: 42,
    reorderLevel: 200,
    shortageRisk: 'LOW',
    expiryRisk: 'LOW',
    recommendedAction: 'Stable',
    batches: [
      {
        id: 'bth-cef-01',
        medicineId: 'med-4',
        medicineName: 'Cefixime 200mg',
        batchNumber: 'BTH-CEF-12',
        currentStock: 450,
        manufacturingDate: '2025-03-01',
        expiryDate: '2027-08-14',
        daysToExpiry: 310,
        unitCost: 1.15,
        supplierName: 'MedPharm Global',
        isFefoFirst: true,
      },
    ],
  },
  {
    id: 'med-5',
    name: 'Metformin 500mg',
    genericName: 'Metformin Hydrochloride',
    brandName: 'Glucophage',
    category: 'Antidiabetic Agents',
    atcCode: 'A10BA02',
    dosageForm: 'Extended Release Tablet',
    totalStock: 890,
    dailyDemand: 160,
    reorderLevel: 600,
    shortageRisk: 'MEDIUM',
    expiryRisk: 'LOW',
    recommendedAction: 'Reorder Safety Buffer',
    batches: [
      {
        id: 'bth-met-01',
        medicineId: 'med-5',
        medicineName: 'Metformin 500mg',
        batchNumber: 'BTH-MET-33',
        currentStock: 350,
        manufacturingDate: '2025-01-18',
        expiryDate: '2027-01-15',
        daysToExpiry: 99,
        unitCost: 0.18,
        supplierName: 'Novis Health',
        isFefoFirst: true,
      },
      {
        id: 'bth-met-02',
        medicineId: 'med-5',
        medicineName: 'Metformin 500mg',
        batchNumber: 'BTH-MET-34',
        currentStock: 540,
        manufacturingDate: '2025-05-12',
        expiryDate: '2027-09-30',
        daysToExpiry: 357,
        unitCost: 0.18,
        supplierName: 'Novis Health',
        isFefoFirst: false,
      },
    ],
  },
  {
    id: 'med-6',
    name: 'Ceftriaxone 1g Injection',
    genericName: 'Ceftriaxone Sodium',
    brandName: 'Rocephin',
    category: 'Injectable Antibiotics',
    atcCode: 'J01DD04',
    dosageForm: 'Vial for IV/IM',
    totalStock: 180,
    dailyDemand: 65,
    reorderLevel: 220,
    shortageRisk: 'HIGH',
    expiryRisk: 'LOW',
    recommendedAction: 'Urgent Supplier Request',
    batches: [
      {
        id: 'bth-ctx-01',
        medicineId: 'med-6',
        medicineName: 'Ceftriaxone 1g Injection',
        batchNumber: 'BTH-CTX-08',
        currentStock: 180,
        manufacturingDate: '2025-02-10',
        expiryDate: '2027-03-22',
        daysToExpiry: 165,
        unitCost: 3.40,
        supplierName: 'Apex Pharma Ltd',
        isFefoFirst: true,
      },
    ],
  },
];

const INITIAL_ALERTS: SystemAlert[] = [
  {
    id: 'alt-1',
    type: 'SHORTAGE',
    severity: 'HIGH',
    title: '7 medicines have high shortage risk',
    description: 'Paracetamol 500mg, Ceftriaxone 1g and Ibuprofen 400mg projected to breach minimum safety buffer in <7 days.',
    timestamp: '14 minutes ago',
    department: 'Emergency & General Medicine',
  },
  {
    id: 'alt-2',
    type: 'EXPIRY',
    severity: 'WARNING',
    title: '12 batches are approaching expiry',
    description: 'Batches with <60 days shelf life require FEFO prioritization before next distribution cycle.',
    timestamp: '42 minutes ago',
    department: 'Inpatient Satellites',
  },
  {
    id: 'alt-3',
    type: 'SUPPLIER',
    severity: 'WARNING',
    title: 'Supplier delivery delayed for 3 medicines',
    description: 'MedPharm Global reported logistics delay for Amoxicillin & Ceftriaxone shipments.',
    timestamp: '2 hours ago',
    department: 'Central Warehouse',
  },
  {
    id: 'alt-4',
    type: 'EMERGENCY_REQUEST',
    severity: 'HIGH',
    title: 'Emergency department requested additional stock',
    description: 'Urgent requisition for 150 vials of Analgesic and IV fluids submitted by Trauma Unit.',
    timestamp: '3 hours ago',
    department: 'Emergency Wing',
  },
];

const INITIAL_TRANSACTIONS: DispenseTransaction[] = [
  {
    id: 'tx-1001',
    transactionId: 'TX-2026-9041',
    medicineId: 'med-1',
    medicineName: 'Paracetamol 500mg',
    batchId: 'bth-2401',
    batchNumber: 'BTH-2401',
    quantity: 30,
    dispensedBy: 'Elena Rostova, RPh',
    patientId: 'PT-88392',
    department: 'Outpatient Clinic',
    timestamp: 'Today at 17:45',
    status: 'COMPLETED',
  },
  {
    id: 'tx-1002',
    transactionId: 'TX-2026-9040',
    medicineId: 'med-2',
    medicineName: 'Amoxicillin 500mg',
    batchId: 'bth-amx-01',
    batchNumber: 'BTH-AMX-89',
    quantity: 20,
    dispensedBy: 'Elena Rostova, RPh',
    patientId: 'PT-88371',
    department: 'Emergency Trauma',
    timestamp: 'Today at 16:12',
    status: 'COMPLETED',
  },
  {
    id: 'tx-1003',
    transactionId: 'TX-2026-9039',
    medicineId: 'med-4',
    medicineName: 'Cefixime 200mg',
    batchId: 'bth-cef-01',
    batchNumber: 'BTH-CEF-12',
    quantity: 14,
    dispensedBy: 'Elena Rostova, RPh',
    patientId: 'PT-88310',
    department: 'Pediatrics Ward',
    timestamp: 'Today at 14:30',
    status: 'COMPLETED',
  },
];

class PharmacyStateStore {
  private medicines: MedicineItem[] = [];
  private transactions: DispenseTransaction[] = [];
  private alerts: SystemAlert[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const savedMed = localStorage.getItem('medlink_medicines_v2');
      this.medicines = savedMed ? JSON.parse(savedMed) : INITIAL_MEDICINES;

      const savedTx = localStorage.getItem('medlink_transactions_v2');
      this.transactions = savedTx ? JSON.parse(savedTx) : INITIAL_TRANSACTIONS;

      const savedAlt = localStorage.getItem('medlink_alerts_v2');
      this.alerts = savedAlt ? JSON.parse(savedAlt) : INITIAL_ALERTS;
    } catch {
      this.medicines = INITIAL_MEDICINES;
      this.transactions = INITIAL_TRANSACTIONS;
      this.alerts = INITIAL_ALERTS;
    }
    this.recalculateFefo();
  }

  private saveState() {
    try {
      localStorage.setItem('medlink_medicines_v2', JSON.stringify(this.medicines));
      localStorage.setItem('medlink_transactions_v2', JSON.stringify(this.transactions));
      localStorage.setItem('medlink_alerts_v2', JSON.stringify(this.alerts));
    } catch (e) {
      console.error('Failed saving to localStorage', e);
    }
    this.notify();
  }

  private recalculateFefo() {
    this.medicines.forEach((med) => {
      // Sort batches by expiry date ascending (FEFO)
      med.batches.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
      med.batches.forEach((b, idx) => {
        b.isFefoFirst = idx === 0 && b.currentStock > 0;
      });
      med.totalStock = med.batches.reduce((sum, b) => sum + b.currentStock, 0);
    });
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getMedicines(): MedicineItem[] {
    return [...this.medicines];
  }

  public getMedicine(idOrName: string): MedicineItem | undefined {
    const term = idOrName.toLowerCase().trim();
    return this.medicines.find(
      (m) => m.id.toLowerCase() === term || m.name.toLowerCase().includes(term) || m.genericName.toLowerCase().includes(term)
    );
  }

  public getTransactions(): DispenseTransaction[] {
    return [...this.transactions];
  }

  public getAlerts(): SystemAlert[] {
    return [...this.alerts];
  }

  public dispenseMedicine(params: {
    medicineId: string;
    batchId: string;
    quantity: number;
    dispensedBy: string;
    patientId?: string;
    department?: string;
  }): { success: boolean; message: string; transaction?: DispenseTransaction } {
    const med = this.medicines.find((m) => m.id === params.medicineId);
    if (!med) {
      return { success: false, message: 'Medicine not found in catalog.' };
    }

    const batch = med.batches.find((b) => b.id === params.batchId);
    if (!batch) {
      return { success: false, message: 'Batch not found for this medicine.' };
    }

    if (batch.currentStock < params.quantity) {
      return {
        success: false,
        message: `Insufficient stock in batch ${batch.batchNumber}. Available: ${batch.currentStock} units.`,
      };
    }

    // Deduct stock
    batch.currentStock -= params.quantity;
    this.recalculateFefo();

    // Create transaction
    const newTx: DispenseTransaction = {
      id: 'tx-' + Date.now(),
      transactionId: `TX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      medicineId: med.id,
      medicineName: med.name,
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      quantity: params.quantity,
      dispensedBy: params.dispensedBy,
      patientId: params.patientId || `PT-${Math.floor(10000 + Math.random() * 90000)}`,
      department: params.department || 'Outpatient Dispensing',
      timestamp: 'Just now',
      status: 'COMPLETED',
    };

    this.transactions.unshift(newTx);

    // If stock goes below reorder level, push an alert
    if (med.totalStock <= med.reorderLevel) {
      this.alerts.unshift({
        id: 'alt-' + Date.now(),
        type: 'SHORTAGE',
        severity: 'HIGH',
        title: `${med.name} stock is below reorder level`,
        description: `Current stock (${med.totalStock} units) has fallen below minimum safety threshold (${med.reorderLevel} units).`,
        timestamp: 'Just now',
        department: 'Pharmacy Inventory',
      });
    }

    this.saveState();

    return {
      success: true,
      message: `${params.quantity} units of ${med.name} dispensed successfully from batch ${batch.batchNumber}.`,
      transaction: newTx,
    };
  }

  public restockMedicine(params: {
    medicineId: string;
    batchNumber: string;
    quantity: number;
    expiryDate: string;
    unitCost: number;
    supplierName: string;
  }) {
    const med = this.medicines.find((m) => m.id === params.medicineId);
    if (!med) return false;

    const existingBatch = med.batches.find((b) => b.batchNumber === params.batchNumber);
    if (existingBatch) {
      existingBatch.currentStock += params.quantity;
    } else {
      const daysToExpiry = Math.max(1, Math.round((new Date(params.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      med.batches.push({
        id: 'bth-' + Date.now(),
        medicineId: med.id,
        medicineName: med.name,
        batchNumber: params.batchNumber,
        currentStock: params.quantity,
        manufacturingDate: new Date().toISOString().split('T')[0],
        expiryDate: params.expiryDate,
        daysToExpiry,
        unitCost: params.unitCost,
        supplierName: params.supplierName,
      });
    }

    this.recalculateFefo();
    this.saveState();
    return true;
  }
}

export const pharmacyStore = new PharmacyStateStore();
