'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category } from '@/types';
import { supabase } from '@/lib/supabase';

export type LifecycleStage =
  | '1_CITIZEN_SUBMITTED'
  | '2_STUDENT_PROPOSAL'
  | '3_UNIVERSITY_APPROVED'
  | '4_PROTOTYPE_SUBMITTED'
  | '5_SEEKING_FUNDS'
  | '6_FUNDED_DEPLOYED';

export interface StudentProposal {
  solutionTitle: string;
  teamName: string;
  studentLead: string;
  university: string;
  abstract: string;
  proposedBudgetINR: number;
  submittedAt: string;
}

export interface UniversityVerification {
  approvedByFaculty: string;
  labName: string;
  feedbackNotes: string;
  approvedAt: string;
}

export interface PrototypeDetails {
  prototypeName: string;
  demoUrl: string;
  billOfMaterials: string;
  completionPercent: number;
  testedMetric: string;
  submittedAt: string;
}

export interface FundingDetails {
  targetINR: number;
  raisedINR: number;
  industrySponsors: Array<{ company: string; amountINR: number }>;
  govtGrantINR: number;
}

export interface GovtDeployment {
  municipalWard: string;
  deploymentOfficer: string;
  workOrderNumber: string;
  authorizedAt: string;
}

export interface CivicProblemItem {
  id: string;
  title: string;
  description: string;
  category: Category;
  latitude: number;
  longitude: number;
  address: string;
  priorityScore: number;
  slaRemainingHours: number;
  reportsCount: number;
  upvotesCount: number;
  hasUpvoted?: boolean;
  assignedUniversity?: string;
  status: 'REPORTED' | 'VERIFIED' | 'ADOPTED_CAPSTONE' | 'PROTOTYPE_READY' | 'DEPLOYED' | 'RESOLVED';
  stage?: LifecycleStage;
  createdAt: string;

  // Lifecycle Metadata
  studentProposal?: StudentProposal;
  universityVerification?: UniversityVerification;
  prototypeDetails?: PrototypeDetails;
  funding?: FundingDetails;
  govtDeployment?: GovtDeployment;
}

interface CivicDataContextType {
  problems: CivicProblemItem[];
  selectedProblem: CivicProblemItem | null;
  setSelectedProblem: (problem: CivicProblemItem | null) => void;
  addProblem: (newProblem: Omit<CivicProblemItem, 'id' | 'createdAt' | 'upvotesCount' | 'priorityScore' | 'slaRemainingHours' | 'reportsCount' | 'stage' | 'status'>) => CivicProblemItem;
  upvoteProblem: (id: string) => void;
  submitStudentProposal: (problemId: string, proposal: Omit<StudentProposal, 'submittedAt'>) => void;
  universityApproveProposal: (problemId: string, approval: Omit<UniversityVerification, 'approvedAt'>) => void;
  studentSubmitPrototype: (problemId: string, details: Omit<PrototypeDetails, 'submittedAt'>) => void;
  universityApprovePrototypeAndPostFunds: (problemId: string, targetFundsINR: number) => void;
  industryPledgeFunding: (problemId: string, companyName: string, amountINR: number) => void;
  governmentAuthorizeDeployment: (problemId: string, deployment: Omit<GovtDeployment, 'authorizedAt'>) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
}

const INITIAL_PROBLEMS: CivicProblemItem[] = [
  {
    id: 'pt-001',
    title: 'Main Drinking Water Pipeline Rupture',
    description: 'High-pressure 400mm municipal feeder pipe cracked, leaking ~12,000L/hr of treated water into open gutter, causing severe local contamination and low pressure.',
    category: 'WATER_SANITATION',
    latitude: 28.6139,
    longitude: 77.2090,
    address: 'Sector 4, Rohini, New Delhi',
    priorityScore: 94.5,
    slaRemainingHours: 11,
    reportsCount: 24,
    upvotesCount: 58,
    status: 'PROTOTYPE_READY',
    assignedUniversity: 'IIT Delhi Civil & Environmental Lab',
    stage: '5_SEEKING_FUNDS',
    createdAt: '2026-09-12T08:00:00Z',
    studentProposal: {
      solutionTitle: 'IoT Ultrasonic Acoustic Clamp-on Pipe Leak Detector',
      teamName: 'HydroVigil IITD',
      studentLead: 'Rohan Verma (M.Tech Env)',
      university: 'IIT Delhi Civil & Environmental Lab',
      abstract: 'Non-invasive acoustic frequency monitoring clamp that detects pipeline micro-fractures before catastrophic blowout.',
      proposedBudgetINR: 350000,
      submittedAt: '2026-09-12T10:00:00Z',
    },
    universityVerification: {
      approvedByFaculty: 'Prof. S. Sharma',
      labName: 'IITD Environmental Hydraulics Lab',
      feedbackNotes: 'Feasible sensor calibration. Lab bench test approved.',
      approvedAt: '2026-09-12T14:00:00Z',
    },
    prototypeDetails: {
      prototypeName: 'HydroVigil Mark II Rig',
      demoUrl: 'https://github.com/iitd-civic-leak-iot/sensor-firmware',
      billOfMaterials: 'Ultrasonic Piezo Transducer, ESP32 LoRa, Solar LiFePO4 pack',
      completionPercent: 90,
      testedMetric: 'Pinpoints leak location within 1.2m radius',
      submittedAt: '2026-09-13T04:00:00Z',
    },
    funding: {
      targetINR: 350000,
      raisedINR: 150000,
      industrySponsors: [{ company: 'Tata Trust Clean Water CSR', amountINR: 150000 }],
      govtGrantINR: 0,
    },
  },
  {
    id: 'pt-002',
    title: 'Major Arterial Road Cave-in & Pothole Cluster',
    description: 'Consecutive heavy rainfall caused 2.5-meter deep sub-base erosion, resulting in road collapse right outside Pitampura Metro Station gate 2.',
    category: 'INFRASTRUCTURE_ROADS',
    latitude: 28.5355,
    longitude: 77.2410,
    address: 'Outer Ring Road, Pitampura, New Delhi',
    priorityScore: 88.0,
    slaRemainingHours: 28,
    reportsCount: 18,
    upvotesCount: 42,
    status: 'ADOPTED_CAPSTONE',
    assignedUniversity: 'DTU Transportation Lab',
    stage: '3_UNIVERSITY_APPROVED',
    createdAt: '2026-09-11T14:30:00Z',
    studentProposal: {
      solutionTitle: 'Rapid Geopolymer Cold-Patch Resin with Embedded Strain Gauge',
      teamName: 'AsphaltTech DTU',
      studentLead: 'Kunal Mehra (B.Tech Civil)',
      university: 'DTU Transportation Lab',
      abstract: 'Instant ambient-cure geopolymer asphalt patch that cures in 20 minutes and signals heavy load settlement.',
      proposedBudgetINR: 200000,
      submittedAt: '2026-09-12T09:30:00Z',
    },
    universityVerification: {
      approvedByFaculty: 'Dr. V. Rao',
      labName: 'DTU Advanced Pavements Lab',
      feedbackNotes: 'Approved for compressive strength compression testing in lab bay 3.',
      approvedAt: '2026-09-12T16:00:00Z',
    },
  },
  {
    id: 'pt-003',
    title: 'Toxic Industrial Waste Runoff in Drain 4',
    description: 'Chemical electroplating runoff draining into stormwater sewer without treatment. High chromium and lead levels detected by community water test.',
    category: 'ENVIRONMENT_WASTE',
    latitude: 28.5284,
    longitude: 77.2796,
    address: 'Okhla Industrial Area Phase-II, New Delhi',
    priorityScore: 96.0,
    slaRemainingHours: 8,
    reportsCount: 31,
    upvotesCount: 94,
    status: 'DEPLOYED',
    assignedUniversity: 'IIT Delhi Chemical Engineering',
    stage: '6_FUNDED_DEPLOYED',
    createdAt: '2026-09-10T10:15:00Z',
    studentProposal: {
      solutionTitle: 'Bio-Char & Electro-Coagulation Waste Stream Neutralizer',
      teamName: 'CleanStream IITD',
      studentLead: 'Ananya Roy (Ph.D Chemical)',
      university: 'IIT Delhi Chemical Engineering',
      abstract: 'Automated modular bio-char filter column that precipitates heavy metals before effluent enters municipal drains.',
      proposedBudgetINR: 500000,
      submittedAt: '2026-09-10T12:00:00Z',
    },
    universityVerification: {
      approvedByFaculty: 'Prof. H. Sengupta',
      labName: 'IITD Green Chemistry Center',
      feedbackNotes: 'Verified 99.4% chromium removal in continuous flow column.',
      approvedAt: '2026-09-11T11:00:00Z',
    },
    prototypeDetails: {
      prototypeName: 'CleanStream Modular Column',
      demoUrl: 'https://youtube.com/watch?v=cleanstream-demo',
      billOfMaterials: 'Titanium electrodes, activated pyrolyzed bio-char, PLC controller',
      completionPercent: 100,
      testedMetric: 'Safe effluent discharge certified by PCB lab',
      submittedAt: '2026-09-12T08:00:00Z',
    },
    funding: {
      targetINR: 500000,
      raisedINR: 500000,
      industrySponsors: [
        { company: 'Mahindra Sustainability CSR', amountINR: 300000 },
        { company: 'Larsen & Toubro Green Tech', amountINR: 100000 },
      ],
      govtGrantINR: 100000,
    },
    govtDeployment: {
      municipalWard: 'Okhla Industrial Ward 28',
      deploymentOfficer: 'Shri A.K. Dixit (Superintending Engineer)',
      workOrderNumber: 'WO-DEL-OKHLA-902',
      authorizedAt: '2026-09-13T09:00:00Z',
    },
  },
  {
    id: 'pt-004',
    title: 'High-Tension Power Cable Sagging Near School',
    description: '11kV overhead distribution wire sagging below 3.5 meters across main school pedestrian entrance, posing life safety hazard to 1,200 students.',
    category: 'ENERGY_POWER',
    latitude: 28.7041,
    longitude: 77.1025,
    address: 'Janakpuri Block B, New Delhi',
    priorityScore: 89.2,
    slaRemainingHours: 19,
    reportsCount: 15,
    upvotesCount: 37,
    status: 'VERIFIED',
    assignedUniversity: 'NSUT Power Systems Lab',
    stage: '2_STUDENT_PROPOSAL',
    createdAt: '2026-09-12T11:20:00Z',
    studentProposal: {
      solutionTitle: 'Self-Tensioning Thermal Cam Counterweight Arm',
      teamName: 'VoltSafe NSUT',
      studentLead: 'Aarav Gupta (B.Tech Electrical)',
      university: 'NSUT Power Systems Lab',
      abstract: 'Mechanical counterweight that dynamically compensates for aluminum line thermal expansion during peak load.',
      proposedBudgetINR: 180000,
      submittedAt: '2026-09-13T06:00:00Z',
    },
  },
  {
    id: 'pt-005',
    title: 'Primary Health Center Vaccine Cold Chain Failure',
    description: 'Unreliable grid power and burnt inverter board caused solar cold-storage temperature to spike to +14C, risking polio and MMR vaccine stock.',
    category: 'HEALTHCARE',
    latitude: 28.6692,
    longitude: 77.1950,
    address: 'Daryaganj Ward 12, Old Delhi',
    priorityScore: 91.0,
    slaRemainingHours: 14,
    reportsCount: 22,
    upvotesCount: 65,
    status: 'PROTOTYPE_READY',
    assignedUniversity: 'AIIMS Biomedical & DTU Mechatronics',
    stage: '4_PROTOTYPE_SUBMITTED',
    createdAt: '2026-09-11T09:45:00Z',
    studentProposal: {
      solutionTitle: 'Hybrid Phase-Change Material (PCM) Vaccine Cooling Pod',
      teamName: 'BioFreeze AIIMS-DTU',
      studentLead: 'Dr. Sneha Patel & Varun Jha',
      university: 'AIIMS Biomedical & DTU Mechatronics',
      abstract: 'Passive salt-hydrate PCM cylinder maintaining 4°C for 72 hours without continuous electricity.',
      proposedBudgetINR: 280000,
      submittedAt: '2026-09-11T14:00:00Z',
    },
    universityVerification: {
      approvedByFaculty: 'Dr. N. Mittal',
      labName: 'AIIMS Medical Devices Prototyping Facility',
      feedbackNotes: 'Passed thermal chamber stress test from -5C to +45C.',
      approvedAt: '2026-09-12T10:00:00Z',
    },
    prototypeDetails: {
      prototypeName: 'BioFreeze Pod v1',
      demoUrl: 'https://github.com/aiims-dtu-biofreeze/hardware',
      billOfMaterials: 'Vacuum insulated panel, PCM-4 eutectic gel, BLE temp logger',
      completionPercent: 85,
      testedMetric: 'Maintained 3.8C for 68 hours during simulated blackout',
      submittedAt: '2026-09-13T05:30:00Z',
    },
  },
  {
    id: 'pt-006',
    title: 'Agricultural Canal Silt Choking & Tail Drought',
    description: 'Canal distributary 7 blocked by 4-foot silt layer and invasive water hyacinth, leaving 80 smallholder vegetable farmers without irrigation water.',
    category: 'AGRICULTURE',
    latitude: 28.8245,
    longitude: 77.0850,
    address: 'Narela Rural Agricultural Belt, North Delhi',
    priorityScore: 79.5,
    slaRemainingHours: 42,
    reportsCount: 12,
    upvotesCount: 29,
    status: 'REPORTED',
    stage: '1_CITIZEN_SUBMITTED',
    createdAt: '2026-09-12T16:00:00Z',
  },
  {
    id: 'pt-007',
    title: 'Unregulated Solid Waste Landfill Smoldering',
    description: 'Methane pocket combustion at municipal transfer station emitting thick noxious fumes into surrounding residential colony. PM2.5 exceeded 420 ug/m3.',
    category: 'ENVIRONMENT_WASTE',
    latitude: 28.6255,
    longitude: 77.3312,
    address: 'Ghazipur Perimeter Ward, East Delhi',
    priorityScore: 93.0,
    slaRemainingHours: 12,
    reportsCount: 27,
    upvotesCount: 88,
    status: 'PROTOTYPE_READY',
    assignedUniversity: 'Jamia Millia Civil & Environmental',
    stage: '5_SEEKING_FUNDS',
    createdAt: '2026-09-09T18:30:00Z',
    studentProposal: {
      solutionTitle: 'Sub-surface Nitrogen Foam & Bio-Soil Capping Unit',
      teamName: 'EcoCap Jamia',
      studentLead: 'Zaid Khan (M.Tech Env)',
      university: 'Jamia Millia Civil & Environmental',
      abstract: 'Pressurized inert gas injection lance coupled with compost clay barrier to quench subterranean landfill fires.',
      proposedBudgetINR: 420000,
      submittedAt: '2026-09-10T15:00:00Z',
    },
    universityVerification: {
      approvedByFaculty: 'Prof. M. Siddiqui',
      labName: 'Jamia Environmental Engineering Lab',
      feedbackNotes: 'Safe extinguishing mechanism verified with mock landfill core.',
      approvedAt: '2026-09-11T12:00:00Z',
    },
    prototypeDetails: {
      prototypeName: 'EcoCap Injection Rig',
      demoUrl: 'https://github.com/jamia-ecocap/rig-specs',
      billOfMaterials: 'Stainless steel lance, nitrogen regulator, methane infrared probe',
      completionPercent: 95,
      testedMetric: 'Quenches 350C hotspot in 18 minutes in pilot tube',
      submittedAt: '2026-09-12T14:00:00Z',
    },
    funding: {
      targetINR: 420000,
      raisedINR: 200000,
      industrySponsors: [{ company: 'Hero MotoCorp CSR Impact', amountINR: 200000 }],
      govtGrantINR: 0,
    },
  },
  {
    id: 'pt-008',
    title: 'Urban Waterlogging Bottleneck at Railway Underpass',
    description: 'Stationary diesel dewatering pump seized. Underpass submerged under 4 feet of stormwater during moderate shower, stranding municipal buses.',
    category: 'INFRASTRUCTURE_ROADS',
    latitude: 28.5140,
    longitude: 77.2910,
    address: 'Pul Prahladpur Railway Underpass, South Delhi',
    priorityScore: 85.5,
    slaRemainingHours: 32,
    reportsCount: 19,
    upvotesCount: 51,
    status: 'REPORTED',
    stage: '1_CITIZEN_SUBMITTED',
    createdAt: '2026-09-10T11:00:00Z',
  },
  {
    id: 'pt-009',
    title: 'Nighttime Dark Corridors & Vandalized Streetlights',
    description: '14 consecutive sodium-vapor pole fixtures non-functional due to copper cable theft, creating hazardous transit corridor for shift workers and women.',
    category: 'PUBLIC_SAFETY',
    latitude: 28.5921,
    longitude: 77.0460,
    address: 'Dwarka Sector 14 Metro Access Corridor',
    priorityScore: 82.0,
    slaRemainingHours: 36,
    reportsCount: 16,
    upvotesCount: 47,
    status: 'VERIFIED',
    assignedUniversity: 'NSUT IoT & Embedded Systems Lab',
    stage: '2_STUDENT_PROPOSAL',
    createdAt: '2026-09-11T20:15:00Z',
    studentProposal: {
      solutionTitle: 'Tamper-Proof Solar Mesh Streetlights with Mesh RF Beacon',
      teamName: 'LumenNSUT',
      studentLead: 'Pooja Nair (B.Tech ECE)',
      university: 'NSUT IoT & Embedded Systems Lab',
      abstract: 'Pole-top integrated solar luminaire with wireless mesh tamper alert and automated citizen SOS audio siren.',
      proposedBudgetINR: 220000,
      submittedAt: '2026-09-12T19:00:00Z',
    },
  },
  {
    id: 'pt-010',
    title: 'Hospital Bio-Medical Waste Improper Segregation',
    description: 'Infectious clinical waste, syringes, and PPE dumped in unlined municipal open bin alongside organic food scraps, attracting stray animals.',
    category: 'HEALTHCARE',
    latitude: 28.6820,
    longitude: 77.2215,
    address: 'Civil Lines Sub-District Health Facility, Delhi',
    priorityScore: 95.0,
    slaRemainingHours: 10,
    reportsCount: 29,
    upvotesCount: 76,
    status: 'PROTOTYPE_READY',
    assignedUniversity: 'AIIMS Community Medicine & IITD ChemEng',
    stage: '4_PROTOTYPE_SUBMITTED',
    createdAt: '2026-09-12T07:15:00Z',
    studentProposal: {
      solutionTitle: 'RFID Auto-Locking Color-Coded Medical Waste Receptacle',
      teamName: 'MediSort IITD-AIIMS',
      studentLead: 'Sameer Sen & Dr. Divya R',
      university: 'AIIMS Community Medicine & IITD ChemEng',
      abstract: 'Smart bin lid that scans RFID wristband of nurse, unlocks only the appropriate sharps/yellow/red container, and logs tare weight.',
      proposedBudgetINR: 310000,
      submittedAt: '2026-09-12T11:00:00Z',
    },
    universityVerification: {
      approvedByFaculty: 'Prof. R. Banerjee',
      labName: 'IITD Mechatronics & Biomedical Lab',
      feedbackNotes: 'RFID tag reader and pneumatic latch approved for mock hospital ward.',
      approvedAt: '2026-09-12T15:30:00Z',
    },
    prototypeDetails: {
      prototypeName: 'MediSort v2 Bin Rig',
      demoUrl: 'https://github.com/medisort-civic/firmware',
      billOfMaterials: 'RFID RC522, solenoid lock, load cell strain gauge, OLED display',
      completionPercent: 88,
      testedMetric: 'Zero misclassification across 400 test disposals',
      submittedAt: '2026-09-13T06:45:00Z',
    },
  },
];

const CivicDataContext = createContext<CivicDataContextType | undefined>(undefined);

export function CivicDataProvider({ children }: { children: React.ReactNode }) {
  const [problems, setProblems] = useState<CivicProblemItem[]>(INITIAL_PROBLEMS);
  const [selectedProblem, setSelectedProblem] = useState<CivicProblemItem | null>(INITIAL_PROBLEMS[0]);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Load live submitted problems from Supabase on mount
  useEffect(() => {
    async function loadSupabaseProblems() {
      try {
        const { data, error } = await supabase
          .from('problems')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          const mapped: CivicProblemItem[] = data.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            latitude: item.latitude || 28.6139,
            longitude: item.longitude || 77.209,
            address: item.address || 'Municipal Ward',
            priorityScore: item.priority_score || 85,
            slaRemainingHours: 36,
            reportsCount: 1,
            upvotesCount: item.upvote_count || 1,
            status: (item.status as any) || 'REPORTED',
            stage: '1_CITIZEN_SUBMITTED',
            createdAt: item.created_at || new Date().toISOString(),
          }));

          setProblems((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newRecords = mapped.filter((m) => !existingIds.has(m.id));
            return [...newRecords, ...prev];
          });
        }
      } catch (err) {
        console.warn('Could not load problems from Supabase database:', err);
      }
    }

    loadSupabaseProblems();

    // Realtime Supabase change listener
    const channel = supabase
      .channel('public:problems_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'problems' },
        (payload) => {
          const item = payload.new as any;
          if (!item || !item.id) return;

          const newItem: CivicProblemItem = {
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            latitude: item.latitude || 28.6139,
            longitude: item.longitude || 77.209,
            address: item.address || 'Municipal Ward',
            priorityScore: item.priority_score || 85,
            slaRemainingHours: 36,
            reportsCount: 1,
            upvotesCount: item.upvote_count || 1,
            status: (item.status as any) || 'REPORTED',
            stage: '1_CITIZEN_SUBMITTED',
            createdAt: item.created_at || new Date().toISOString(),
          };

          setProblems((prev) => [newItem, ...prev.filter((p) => p.id !== newItem.id)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Stage 1: Citizen submits a query
  const addProblem = (newProb: Omit<CivicProblemItem, 'id' | 'createdAt' | 'upvotesCount' | 'priorityScore' | 'slaRemainingHours' | 'reportsCount' | 'stage' | 'status'>): CivicProblemItem => {
    const baseSeverity = newProb.category === 'WATER_SANITATION' || newProb.category === 'HEALTHCARE' ? 4.5 : 4.0;
    const initialScore = Math.min(99, Math.round((baseSeverity * 18) + 12));

    const created: CivicProblemItem = {
      ...newProb,
      id: `pt-${String(problems.length + 1).padStart(3, '0')}`,
      priorityScore: initialScore,
      slaRemainingHours: initialScore > 90 ? 24 : 48,
      reportsCount: 1,
      upvotesCount: 1,
      status: 'REPORTED',
      stage: '1_CITIZEN_SUBMITTED',
      createdAt: new Date().toISOString(),
    };

    setProblems((prev) => [created, ...prev]);
    setSelectedProblem(created);
    return created;
  };

  // Upvote problem
  const upvoteProblem = (id: string) => {
    setProblems((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const isUpvoted = p.hasUpvoted;
          const newUpvotes = isUpvoted ? p.upvotesCount - 1 : p.upvotesCount + 1;
          const scoreDelta = isUpvoted ? -0.8 : 0.8;
          const updatedScore = Math.min(99, Math.max(50, Number((p.priorityScore + scoreDelta).toFixed(1))));

          const updated = {
            ...p,
            upvotesCount: newUpvotes,
            hasUpvoted: !isUpvoted,
            priorityScore: updatedScore,
          };

          if (selectedProblem?.id === id) {
            setSelectedProblem(updated);
          }
          return updated;
        }
        return p;
      })
    );
  };

  // Stage 2: Students submit proposal to university
  const submitStudentProposal = (problemId: string, proposal: Omit<StudentProposal, 'submittedAt'>) => {
    setProblems((prev) =>
      prev.map((p) => {
        if (p.id === problemId) {
          const updated: CivicProblemItem = {
            ...p,
            stage: '2_STUDENT_PROPOSAL',
            studentProposal: {
              ...proposal,
              submittedAt: new Date().toISOString(),
            },
          };
          if (selectedProblem?.id === problemId) setSelectedProblem(updated);
          return updated;
        }
        return p;
      })
    );
  };

  // Stage 3: University approves student proposal to build prototype
  const universityApproveProposal = (problemId: string, approval: Omit<UniversityVerification, 'approvedAt'>) => {
    setProblems((prev) =>
      prev.map((p) => {
        if (p.id === problemId) {
          const updated: CivicProblemItem = {
            ...p,
            stage: '3_UNIVERSITY_APPROVED',
            universityVerification: {
              ...approval,
              approvedAt: new Date().toISOString(),
            },
          };
          if (selectedProblem?.id === problemId) setSelectedProblem(updated);
          return updated;
        }
        return p;
      })
    );
  };

  // Stage 4: Students submit prototype for university verification
  const studentSubmitPrototype = (problemId: string, details: Omit<PrototypeDetails, 'submittedAt'>) => {
    setProblems((prev) =>
      prev.map((p) => {
        if (p.id === problemId) {
          const updated: CivicProblemItem = {
            ...p,
            stage: '4_PROTOTYPE_SUBMITTED',
            prototypeDetails: {
              ...details,
              submittedAt: new Date().toISOString(),
            },
          };
          if (selectedProblem?.id === problemId) setSelectedProblem(updated);
          return updated;
        }
        return p;
      })
    );
  };

  // Stage 5: University approves prototype & posts for funding
  const universityApprovePrototypeAndPostFunds = (problemId: string, targetFundsINR: number) => {
    setProblems((prev) =>
      prev.map((p) => {
        if (p.id === problemId) {
          const updated: CivicProblemItem = {
            ...p,
            stage: '5_SEEKING_FUNDS',
            funding: {
              targetINR: targetFundsINR || 300000,
              raisedINR: p.funding?.raisedINR || 0,
              industrySponsors: p.funding?.industrySponsors || [],
              govtGrantINR: p.funding?.govtGrantINR || 0,
            },
          };
          if (selectedProblem?.id === problemId) setSelectedProblem(updated);
          return updated;
        }
        return p;
      })
    );
  };

  // Stage 6A: Industry pledges funding
  const industryPledgeFunding = (problemId: string, companyName: string, amountINR: number) => {
    setProblems((prev) =>
      prev.map((p) => {
        if (p.id === problemId) {
          const currentFunding = p.funding || { targetINR: 300000, raisedINR: 0, industrySponsors: [], govtGrantINR: 0 };
          const newRaised = currentFunding.raisedINR + amountINR;
          const updatedSponsors = [...currentFunding.industrySponsors, { company: companyName, amountINR }];

          const isFullyFunded = newRaised >= currentFunding.targetINR;

          const updated: CivicProblemItem = {
            ...p,
            stage: isFullyFunded ? '6_FUNDED_DEPLOYED' : '5_SEEKING_FUNDS',
            funding: {
              ...currentFunding,
              raisedINR: newRaised,
              industrySponsors: updatedSponsors,
            },
          };
          if (selectedProblem?.id === problemId) setSelectedProblem(updated);
          return updated;
        }
        return p;
      })
    );
  };

  // Stage 6B: Government authorizes municipal field deployment
  const governmentAuthorizeDeployment = (problemId: string, deployment: Omit<GovtDeployment, 'authorizedAt'>) => {
    setProblems((prev) =>
      prev.map((p) => {
        if (p.id === problemId) {
          const updated: CivicProblemItem = {
            ...p,
            stage: '6_FUNDED_DEPLOYED',
            govtDeployment: {
              ...deployment,
              authorizedAt: new Date().toISOString(),
            },
          };
          if (selectedProblem?.id === problemId) setSelectedProblem(updated);
          return updated;
        }
        return p;
      })
    );
  };

  return (
    <CivicDataContext.Provider
      value={{
        problems,
        selectedProblem,
        setSelectedProblem,
        addProblem,
        upvoteProblem,
        submitStudentProposal,
        universityApproveProposal,
        studentSubmitPrototype,
        universityApprovePrototypeAndPostFunds,
        industryPledgeFunding,
        governmentAuthorizeDeployment,
        filterCategory,
        setFilterCategory,
      }}
    >
      {children}
    </CivicDataContext.Provider>
  );
}

export function useCivicData() {
  const context = useContext(CivicDataContext);
  if (!context) {
    throw new Error('useCivicData must be used within a CivicDataProvider');
  }
  return context;
}
