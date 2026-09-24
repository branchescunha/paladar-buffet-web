import { useEffect, useId, useRef } from 'react';
import styled from 'styled-components';

interface ConfirmDeleteDialogProps {
  title: string;
  description?: string;
  confirmLabel: string;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteDialog({ title, description = 'Esta ação não poderá ser desfeita.', confirmLabel, isPending, onCancel, onConfirm }: ConfirmDeleteDialogProps) {
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  return <Backdrop onMouseDown={(event) => { if (event.target === event.currentTarget && !isPending) onCancel(); }}>
    <Dialog role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={`${titleId}-description`} onKeyDown={(event) => { if (event.key === 'Escape' && !isPending) onCancel(); }}>
      <h2 id={titleId}>{title}</h2>
      <p id={`${titleId}-description`}>{description}</p>
      <Actions>
        <CancelButton ref={cancelRef} type="button" disabled={isPending} onClick={onCancel}>Cancelar</CancelButton>
        <DeleteButton type="button" disabled={isPending} onClick={onConfirm}>{isPending ? 'Excluindo...' : confirmLabel}</DeleteButton>
      </Actions>
    </Dialog>
  </Backdrop>;
}

const Backdrop = styled.div`position:fixed;inset:0;z-index:1000;display:grid;place-items:center;background:rgba(0,0,0,.55);padding:${({ theme }) => theme.spacing.md};`;
const Dialog = styled.div`width:min(100%,28rem);border:1px solid ${({ theme }) => theme.colors.border};border-radius:${({ theme }) => theme.radius.md};background:${({ theme }) => theme.colors.surface};box-shadow:0 1.5rem 4rem rgba(0,0,0,.25);padding:${({ theme }) => theme.spacing.xl};h2{margin:0;color:${({ theme }) => theme.colors.textStrong}}p{margin:${({ theme }) => theme.spacing.sm} 0 0;color:${({ theme }) => theme.colors.textMuted}}`;
const Actions = styled.div`display:flex;flex-wrap:wrap;justify-content:flex-end;gap:${({ theme }) => theme.spacing.sm};margin-top:${({ theme }) => theme.spacing.xl};`;
const CancelButton = styled.button`min-height:2.75rem;border:1px solid ${({ theme }) => theme.colors.borderStrong};border-radius:${({ theme }) => theme.radius.md};background:transparent;color:${({ theme }) => theme.colors.textStrong};font-weight:700;padding:0 ${({ theme }) => theme.spacing.lg};`;
const DeleteButton = styled.button`min-height:2.75rem;border:0;border-radius:${({ theme }) => theme.radius.md};background:${({ theme }) => theme.colors.danger};color:${({ theme }) => theme.palette.white};font-weight:800;padding:0 ${({ theme }) => theme.spacing.lg};`;
