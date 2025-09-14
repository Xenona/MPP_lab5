import React from 'react';
import {deleteAttachment, downloadAttachment, getAttachmentUrl} from '../services/api';
import type { Attachment } from '../types';

interface AttachmentsListProps {
    attachments: Attachment[];
    taskId: string;
    onRefresh: () => void;
}

const AttachmentsList: React.FC<AttachmentsListProps> = ({ attachments, taskId, onRefresh }) => {
    const handleDelete = async (filename: string) => {
        if (confirm('Delete attachment?')) {
            try {
                await deleteAttachment(taskId, filename);
                onRefresh();
            } catch {
                alert('Failed to delete attachment:');
            }
        }
    };

    const isImage = (name: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(name);

    return (
        <section style={{ marginTop: '12px' }}>
            <h4>Attachments</h4>
            <div className="attachments">
                {attachments.map((att) => (
                    <div key={att.filename} className="attachment" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        marginBottom: '8px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isImage(att.originalName) ? (
                                <img
                                    src={getAttachmentUrl(taskId, att.filename)}
                                    alt={att.originalName}
                                    className="preview-img"
                                    onClick={() => downloadAttachment(taskId, att.filename, att.originalName)}
                                />
                            ) : (
                                <span>{att.originalName}</span>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                                className="small"
                                onClick={() => downloadAttachment(taskId, att.filename, att.originalName)}
                            >
                                Download
                            </button>
                            <button
                                className="danger small"
                                onClick={() => handleDelete(att.filename)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default AttachmentsList;