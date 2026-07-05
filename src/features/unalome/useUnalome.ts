import { db } from '@/lib/db';
import type { UnalomeProgress } from '@/types/unalome';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useEffect } from 'react';
import { UNALOME_NODES } from './curriculumData';
import { addOffering } from '@/features/waikru/useWaiKru';

export function useUnalome() {
  const progressList = useLiveQuery(() => db.unalomeProgress.toArray(), []);

  // Initialize the first node if the path is completely empty
  useEffect(() => {
    async function initPath() {
      const count = await db.unalomeProgress.count();
      if (count === 0) {
        // Unlock nodes that have no requirements
        const initialNodes = UNALOME_NODES.filter(n => n.requires.length === 0);
        for (const node of initialNodes) {
          await db.unalomeProgress.add({
            nodeId: node.id,
            status: 'unlocked',
            unlockedAt: new Date(),
          });
        }
      }
    }
    void initPath();
  }, []);

  const completeNode = useCallback(
    async (nodeId: string) => {
      await db.transaction('rw', db.unalomeProgress, async () => {
        // Mark current as completed
        await db.unalomeProgress.put({
          nodeId,
          status: 'completed',
          completedAt: new Date(),
        });

        // Check if this unlocked any new nodes
        const allProgress = await db.unalomeProgress.toArray();
        const completedIds = new Set(
          allProgress.filter(p => p.status === 'completed').map(p => p.nodeId)
        );

        for (const node of UNALOME_NODES) {
          // If already unlocked or completed, skip
          const nodeProg = allProgress.find(p => p.nodeId === node.id);
          if (nodeProg) continue;

          // Check requirements
          const canUnlock = node.requires.every(req => completedIds.has(req));
          if (canUnlock) {
            await db.unalomeProgress.add({
              nodeId: node.id,
              status: 'unlocked',
              unlockedAt: new Date(),
            });
          }
        }
      });
      void addOffering('khaoTok', 1);
    },
    []
  );

  const getNodeStatus = useCallback(
    (nodeId: string): UnalomeProgress['status'] => {
      const prog = progressList?.find(p => p.nodeId === nodeId);
      return prog?.status ?? 'locked';
    },
    [progressList]
  );

  return {
    progress: progressList ?? [],
    completeNode,
    getNodeStatus,
  };
}
