import { motion } from 'framer-motion';
import { Check, Lock, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UNALOME_NODES, type UnalomeNode } from './curriculumData';
import { useUnalome } from './useUnalome';

export function UnalomeMap() {
  const { getNodeStatus, completeNode } = useUnalome();
  const navigate = useNavigate();

  // Create a smooth curved path string
  const createPath = () => {
    if (UNALOME_NODES.length === 0) return '';
    let d = `M ${String(UNALOME_NODES[0].position.x)} ${String(UNALOME_NODES[0].position.y)}`;
    for (let i = 1; i < UNALOME_NODES.length; i++) {
      const prev = UNALOME_NODES[i - 1].position;
      const curr = UNALOME_NODES[i].position;
      const midY = (prev.y + curr.y) / 2;
      // Cubic bezier curve for a wavy spiral look
      d += ` C ${String(prev.x)} ${String(midY)}, ${String(curr.x)} ${String(midY)}, ${String(curr.x)} ${String(curr.y)}`;
    }
    return d;
  };

  const handleNodeClick = (node: UnalomeNode) => {
    const status = getNodeStatus(node.id);
    if (status === 'locked') return;

    // For demonstration, if it's unlocked, clicking it will just mark it complete
    // In reality, it would navigate to a lesson, and completing the lesson marks it complete
    if (status === 'unlocked') {
      void completeNode(node.id);
      
      // Navigate to the respective feature (mocked for now)
      if (node.type === 'reading') {
        void navigate('/reading');
      } else if (node.type === 'practice') {
        void navigate('/builder');
      }
    }
  };

  return (
    <div className="relative w-full h-[600px] bg-background/50 rounded-3xl border border-border overflow-hidden p-4">
      {/* SVG Path */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d={createPath()}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-primary/20 stroke-dashed"
          strokeDasharray="2 2"
        />
      </svg>

      {/* Nodes */}
      {UNALOME_NODES.map(node => {
        const status = getNodeStatus(node.id);
        const isLocked = status === 'locked';
        const isCompleted = status === 'completed';
        const isUnlocked = status === 'unlocked';

        return (
          <motion.button
            key={node.id}
            onClick={() => { handleNodeClick(node); }}
            disabled={isLocked}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{
              left: `${String(node.position.x)}%`,
              top: `${String(node.position.y)}%`,
            }}
            whileHover={!isLocked ? { scale: 1.1 } : {}}
            whileTap={!isLocked ? { scale: 0.95 } : {}}
          >
            <div className="relative z-10 flex flex-col items-center gap-2">
              <motion.div
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`
                  w-14 h-14 rounded-full flex items-center justify-center border-4 shadow-xl transition-colors
                  ${isCompleted ? 'bg-primary border-primary text-primary-foreground' : ''}
                  ${isUnlocked ? 'bg-background border-primary text-primary animate-pulse' : ''}
                  ${isLocked ? 'bg-muted border-muted-foreground/30 text-muted-foreground' : ''}
                `}
              >
                {isCompleted && <Check className="w-6 h-6" />}
                {isUnlocked && <Play className="w-6 h-6 ml-1" />}
                {isLocked && <Lock className="w-5 h-5" />}
              </motion.div>

              <div
                className={`
                px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-sm backdrop-blur-md
                ${isCompleted ? 'bg-primary/10 text-primary' : ''}
                ${isUnlocked ? 'bg-card text-foreground border border-primary/30' : ''}
                ${isLocked ? 'bg-muted/50 text-muted-foreground hidden group-hover:block' : ''}
              `}
              >
                {node.title}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
