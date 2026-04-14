import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle, Circle, ArrowRight, Shield, Star, Crown, Download, Loader2 } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { api } from '../lib/api';
import ProgressBar from '../components/ProgressBar';

const levels = [
  {
    level: 1,
    title: 'Associate',
    icon: Shield,
    color: 'nobus',
    requirements: [
      'Complete Partner Sales Enablement Bootcamp',
      'Complete Partner Technical Enablement Bootcamp',
      'Pass NCS Associate Technical Assessment (75%+)',
    ],
    benefits: [
      'Authorized for FCS and FBS deployments',
      'Access to partner technical resources portal',
      'Nobus partner badge for marketing materials',
    ],
  },
  {
    level: 2,
    title: 'Professional',
    icon: Star,
    color: 'accent',
    requirements: [
      'Achieve Level 1 Associate certification',
      '3 successful customer deployments',
      'Complete Advanced Architecture Workshop',
    ],
    benefits: [
      'Authorized for complex multi-tier architectures',
      'Migration project authorization',
      'Kubernetes deployment authorization',
      'Listed in Nobus Partner Directory',
    ],
  },
  {
    level: 3,
    title: 'Expert / NPN Certified',
    icon: Crown,
    color: 'amber',
    requirements: [
      'Achieve Level 2 Professional certification',
      'NFT provisioning certification',
      '10 successful customer deployments',
      'Active support of at least 2 enterprise accounts',
    ],
    benefits: [
      'Authorized to provision NFT at all bandwidth tiers',
      'Priority support SLA',
      'Access to Nobus pre-sales technical team',
      'Joint account planning with Nobus',
      'Recurring revenue from NFT resale',
    ],
  },
];

const assessmentDomains = [
  { domain: 'FCS — Instances, NMIs, flavors, Auto Scaling', weight: '25%' },
  { domain: 'Storage — FBS volumes, snapshots, FOS containers', weight: '20%' },
  { domain: 'Networking — VPC, Security Groups, Floating IPs, VPN', weight: '20%' },
  { domain: 'Security — Shared responsibility, firewalls, compliance', weight: '15%' },
  { domain: 'Architecture — HA patterns, DR tiers, migration', weight: '15%' },
  { domain: 'Operations — Monitoring, troubleshooting, support', weight: '5%' },
];

export default function Certification() {
  const { getCourseProgress } = useProgress();
  const [downloading, setDownloading] = useState(null);
  const salesProg = getCourseProgress('sales-enablement');
  const presalesProg = getCourseProgress('presales-enablement');
  const techProg = getCourseProgress('technical-enablement');

  const isComplete = (prog) => prog.completedLessons === prog.totalLessons && prog.passedQuizzes === prog.totalQuizzes;
  const salesComplete = isComplete(salesProg);
  const presalesComplete = isComplete(presalesProg);
  const techComplete = isComplete(techProg);

  const handleDownloadCert = async (pathId) => {
    setDownloading(pathId);
    try {
      const blob = await api.downloadCertificate(pathId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nobus-certificate-${pathId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Failed to download certificate');
    }
    setDownloading(null);
  };

  const progressCards = [
    { label: 'Sales Enablement', prog: salesProg, complete: salesComplete, color: 'nobus', path: 'sales-enablement' },
    { label: 'Presales Enablement', prog: presalesProg, complete: presalesComplete, color: 'nobus', path: 'presales-enablement' },
    { label: 'Technical Enablement', prog: techProg, complete: techComplete, color: 'accent', path: 'technical-enablement' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Certification & Competency Path</h1>
        <p className="text-gray-600">
          Progress through three levels of partner technical competency.
          Each level unlocks additional benefits and deal registration privileges.
        </p>
      </div>

      {/* Current progress */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {progressCards.map((card) => (
          <div key={card.path} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{card.label}</h3>
              {card.complete ? (
                <span className="badge-green"><CheckCircle className="w-3 h-3 inline mr-1" />Complete</span>
              ) : (
                <span className="badge-amber">In Progress</span>
              )}
            </div>
            <ProgressBar value={card.prog.completedLessons} max={card.prog.totalLessons} color={card.color} />
            <div className="text-xs text-gray-500 mt-2">
              {card.prog.completedLessons}/{card.prog.totalLessons} lessons &middot;
              {card.prog.passedQuizzes}/{card.prog.totalQuizzes} quizzes passed
            </div>
            {card.complete ? (
              <button onClick={() => handleDownloadCert(card.path)} disabled={downloading === card.path}
                className="mt-3 inline-flex items-center gap-1 text-sm text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg px-3 py-1.5 transition-colors">
                {downloading === card.path ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                {downloading === card.path ? 'Downloading...' : 'Download Certificate'}
              </button>
            ) : (
              <Link to={`/course/${card.path}`} className="text-nobus-600 text-sm hover:underline mt-3 inline-flex items-center gap-1">
                Continue <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Certification levels */}
      <h2 className="text-xl font-bold text-gray-900 mb-6">Partner Competency Levels</h2>
      <div className="space-y-6 mb-12">
        {levels.map((lvl) => {
          const colors = {
            nobus: { bg: 'bg-nobus-50', border: 'border-nobus-200', icon: 'text-nobus-600', badge: 'bg-nobus-100 text-nobus-700' },
            accent: { bg: 'bg-accent-50', border: 'border-accent-200', icon: 'text-accent-600', badge: 'bg-accent-100 text-accent-700' },
            amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
          };
          const c = colors[lvl.color];

          return (
            <div key={lvl.level} className={`card overflow-hidden border-2 ${c.border}`}>
              <div className={`${c.bg} p-5 flex items-center gap-4`}>
                <div className={`w-12 h-12 rounded-xl ${c.badge} flex items-center justify-center`}>
                  <lvl.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Level {lvl.level} — {lvl.title}</h3>
                </div>
              </div>
              <div className="p-5 grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Requirements</h4>
                  <ul className="space-y-2">
                    {lvl.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <Circle className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Benefits</h4>
                  <ul className="space-y-2">
                    {lvl.benefits.map((ben, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {ben}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assessment structure */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">NCS Associate Technical Assessment</h2>
        <div className="grid sm:grid-cols-3 gap-4 mb-6 text-center">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-nobus-600">50</div>
            <div className="text-xs text-gray-500">Questions</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-nobus-600">90</div>
            <div className="text-xs text-gray-500">Minutes</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-nobus-600">75%</div>
            <div className="text-xs text-gray-500">Passing Score</div>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Exam Domains</h3>
        <div className="space-y-3">
          {assessmentDomains.map((d) => (
            <div key={d.domain} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{d.domain}</span>
              <span className="text-sm font-semibold text-nobus-600 ml-4">{d.weight}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
