'use client';

import React, { useState } from 'react';
import styles from './ResourceList.module.css';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Theme, Resource, ResourceType } from '@/hooks/useThemeData';
import confetti from 'canvas-confetti';

interface ResourceListProps {
    theme: Theme;
    addResource: (resource: Resource) => void;
    removeResource: (resourceId: string) => void;
    toggleResourceCompletion: (resourceId: string) => void;
}

// SVG Icons matching site design
const Icons = {
    web: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    ),
    book: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    ),
    video: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
    ),
    article: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
        </svg>
    ),
    podcast: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
    ),
    other: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
        </svg>
    ),
};

const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
    { value: 'web', label: 'Web' },
    { value: 'book', label: 'Book' },
    { value: 'video', label: 'Video' },
    { value: 'article', label: 'Article' },
    { value: 'podcast', label: 'Podcast' },
    { value: 'other', label: 'Other' },
];

export const ResourceList: React.FC<ResourceListProps> = ({
    theme,
    addResource,
    removeResource,
    toggleResourceCompletion,
}) => {
    const [newTitle, setNewTitle] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newType, setNewType] = useState<ResourceType>('web');
    const [isAdding, setIsAdding] = useState(false);
    const [filterType, setFilterType] = useState<ResourceType | 'all'>('all');
    const [isFetching, setIsFetching] = useState(false);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        // URL is optional for non-web/video types
        if ((newType === 'web' || newType === 'video') && !newUrl.trim()) {
            return;
        }

        addResource({
            id: Date.now().toString(),
            title: newTitle,
            url: newUrl.trim() ? (newUrl.startsWith('http') ? newUrl : `https://${newUrl}`) : undefined,
            type: newType,
            completed: false,
        });

        setNewTitle('');
        setNewUrl('');
        setNewType('web');
        setIsAdding(false);
    };

    const handleUrlBlur = async () => {
        if (!newUrl || newTitle) return; // If title is already set or no URL, skip

        const url = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;

        try {
            setIsFetching(true);
            const res = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`);
            if (res.ok) {
                const data = await res.json();
                if (data.title) {
                    setNewTitle(data.title);
                }
            }
        } catch (error) {
            console.error('Failed to fetch metadata:', error);
        } finally {
            setIsFetching(false);
        }
    };

    const handleToggle = (id: string, completed: boolean) => {
        toggleResourceCompletion(id);
        if (!completed) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    };

    const needsUrl = newType === 'web' || newType === 'video';

    // Filter resources
    const filteredResources = filterType === 'all'
        ? theme.resources
        : theme.resources.filter(r => r.type === filterType);

    // Group resources by type
    const groupedResources = RESOURCE_TYPES.reduce((acc, type) => {
        const resources = filteredResources.filter(r => r.type === type.value);
        if (resources.length > 0) {
            acc.push({ type, resources });
        }
        return acc;
    }, [] as { type: typeof RESOURCE_TYPES[0]; resources: Resource[] }[]);

    // Get available types for filter
    const availableTypes = RESOURCE_TYPES.filter(t =>
        theme.resources.some(r => r.type === t.value)
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Learning Resources</h3>
                <Button size="sm" onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? 'Cancel' : '+ Add'}
                </Button>
            </div>

            {/* Filter bar */}
            {theme.resources.length > 0 && (
                <div className={styles.filterBar}>
                    <button
                        className={`${styles.filterBtn} ${filterType === 'all' ? styles.filterActive : ''}`}
                        onClick={() => setFilterType('all')}
                    >
                        All ({theme.resources.length})
                    </button>
                    {availableTypes.map(type => {
                        const count = theme.resources.filter(r => r.type === type.value).length;
                        return (
                            <button
                                key={type.value}
                                className={`${styles.filterBtn} ${filterType === type.value ? styles.filterActive : ''}`}
                                onClick={() => setFilterType(type.value)}
                            >
                                <span className={styles.filterIcon}>{Icons[type.value]}</span>
                                {count}
                            </button>
                        );
                    })}
                </div>
            )}

            {isAdding && (
                <Card className={styles.formCard}>
                    <form onSubmit={handleAdd} className={styles.form}>
                        <div className={styles.typeSelector}>
                            {RESOURCE_TYPES.map(type => (
                                <button
                                    type="button"
                                    key={type.value}
                                    className={`${styles.typeBtn} ${newType === type.value ? styles.typeBtnActive : ''}`}
                                    onClick={() => setNewType(type.value)}
                                >
                                    <span className={styles.typeIcon}>{Icons[type.value]}</span>
                                    <span className={styles.typeLabel}>{type.label}</span>
                                </button>
                            ))}
                        </div>

                        <Input
                            placeholder={isFetching ? "Fetching title..." : "Title (e.g. React Official Docs)"}
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            required
                        />

                        {needsUrl && (
                            <Input
                                placeholder="URL"
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                required={needsUrl}
                            />
                        )}

                        <Button type="submit">Save Resource</Button>
                    </form>
                </Card>
            )}

            <div className={styles.list}>
                {theme.resources.length === 0 && !isAdding && (
                    <div className={styles.empty}>No resources added yet. Click "+ Add" to get started!</div>
                )}

                {filterType === 'all' ? (
                    // Grouped view
                    groupedResources.map(group => (
                        <div key={group.type.value} className={styles.group}>
                            <div className={styles.groupHeader}>
                                <span className={styles.groupIcon}>{Icons[group.type.value]}</span>
                                <span className={styles.groupLabel}>{group.type.label}</span>
                                <span className={styles.groupCount}>{group.resources.length}</span>
                            </div>
                            <div className={styles.groupItems}>
                                {group.resources.map(resource => (
                                    <ResourceItem
                                        key={resource.id}
                                        resource={resource}
                                        onToggle={() => handleToggle(resource.id, resource.completed)}
                                        onRemove={() => removeResource(resource.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    // Flat filtered view
                    filteredResources.map(resource => (
                        <ResourceItem
                            key={resource.id}
                            resource={resource}
                            onToggle={() => handleToggle(resource.id, resource.completed)}
                            onRemove={() => removeResource(resource.id)}
                            showType
                        />
                    ))
                )}
            </div>
        </div>
    );
};

// Resource item component
interface ResourceItemProps {
    resource: Resource;
    onToggle: () => void;
    onRemove: () => void;
    showType?: boolean;
}

const ResourceItem: React.FC<ResourceItemProps> = ({ resource, onToggle, onRemove, showType }) => {
    return (
        <div className={`${styles.item} ${resource.completed ? styles.itemCompleted : ''}`}>
            <div className={styles.itemLeft}>
                <input
                    type="checkbox"
                    checked={!!resource.completed}
                    onChange={onToggle}
                    className={styles.checkbox}
                />
                {showType && <span className={styles.itemIcon}>{Icons[resource.type]}</span>}
                {resource.url ? (
                    <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                    >
                        {resource.title}
                    </a>
                ) : (
                    <span className={styles.linkText}>{resource.title}</span>
                )}
            </div>
            <button className={styles.removeBtn} onClick={onRemove} title="Remove">
                ×
            </button>
        </div>
    );
};
