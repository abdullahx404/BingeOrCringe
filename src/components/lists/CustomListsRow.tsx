'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, List as ListIcon, Lock, Globe } from 'lucide-react';
import type { CustomList } from '@/types';
import CreateListModal from './CreateListModal';
import styles from './CustomListsRow.module.css';

interface Props {
  lists: CustomList[];
}

export default function CustomListsRow({ lists }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Your Custom Lists</h2>
        <button className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(true)} style={{ borderRadius: 'var(--radius-full)' }}>
          <Plus size={16} /> Create List
        </button>
      </div>

      <div className={styles.grid}>
        {lists.map(list => (
          <Link key={list.id} href={`/list/${list.id}`} className={styles.card}>
            <div className={styles.iconWrap}>
              <ListIcon size={24} className={styles.icon} />
            </div>
            <div className={styles.info}>
              <h3 className={styles.listName}>{list.name}</h3>
              <div className={styles.meta}>
                {list.is_public ? (
                  <><Globe size={12} /> Public</>
                ) : (
                  <><Lock size={12} /> Private</>
                )}
              </div>
            </div>
          </Link>
        ))}

        {lists.length === 0 && (
          <div className={styles.emptyCard} onClick={() => setIsModalOpen(true)}>
            <Plus size={24} className={styles.emptyIcon} />
            <span className={styles.emptyText}>Create your first list</span>
          </div>
        )}
      </div>

      <CreateListModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
