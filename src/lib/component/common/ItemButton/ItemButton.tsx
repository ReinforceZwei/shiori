import React from 'react';
import { UnstyledButton, UnstyledButtonProps } from '@mantine/core';
import styles from './ItemButton.module.css';

interface ItemButtonProps extends UnstyledButtonProps {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  active?: boolean;
}

const ItemButton: React.FC<ItemButtonProps> = (props) => {
  const { label, onClick, icon, active, ...rest } = props;
  return (
    <UnstyledButton className={styles.itemButton} onClick={onClick} data-active={active} {...rest}>
      {icon && <div className={styles.itemButtonIcon}>{icon}</div>}
      <div className={styles.itemButtonLabel}>{label}</div>
    </UnstyledButton>
  );
};

export default ItemButton;