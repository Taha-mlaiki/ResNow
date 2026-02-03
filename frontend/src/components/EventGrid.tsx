import { ReactNode } from 'react';
import styles from './EventGrid.module.css';

interface EventGridProps {
    children: ReactNode;
}

export function EventGrid({ children }: EventGridProps) {
    return <div className={styles.grid}>{children}</div>;
}
