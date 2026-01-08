'use client';

import { createContext, useCallback, useState, ReactNode, useEffect } from 'react';
import { Menu } from '@mantine/core';
import type {
  ContextMenuItem,
  ContextMenuContextValue,
  ContextMenuState,
} from './types';

export const ContextMenuContext = createContext<ContextMenuContextValue | null>(
  null
);

type ContextMenuProviderProps = {
  children: ReactNode;
};

export function ContextMenuProvider({ children }: ContextMenuProviderProps) {
  const [menuState, setMenuState] = useState<ContextMenuState>(null);

  const show = useCallback(
    <T,>(
      event: React.MouseEvent,
      items: ContextMenuItem[] | ((data: T) => ContextMenuItem[]),
      data: T
    ) => {
      event.preventDefault();
      event.stopPropagation();

      const resolvedItems =
        typeof items === 'function' ? items(data) : items;

      setMenuState({
        position: { x: event.clientX, y: event.clientY },
        items: resolvedItems,
        data,
      });
    },
    []
  );

  const hide = useCallback(() => {
    setMenuState(null);
  }, []);

  // Close menu on scroll or resize
  useEffect(() => {
    if (!menuState) return;

    const handleClose = () => hide();
    
    window.addEventListener('scroll', handleClose, true);
    window.addEventListener('resize', handleClose);

    return () => {
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('resize', handleClose);
    };
  }, [menuState, hide]);

  // Close menu on Escape key
  useEffect(() => {
    if (!menuState) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hide();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuState, hide]);

  return (
    <ContextMenuContext.Provider value={{ show, hide }}>
      {children}
      
      {/* Portal for context menu */}
      {menuState && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -9999,
          }}
          onClick={hide}
          onContextMenu={(e) => {
            e.preventDefault();
            hide();
          }}
        >
          <Menu
            opened={true}
            onChange={hide}
            position="bottom-start"
            offset={0}
            withArrow={false}
            closeOnItemClick={true}
          >
            <Menu.Target>
              <div
                style={{
                  position: 'absolute',
                  top: menuState.position.y,
                  left: menuState.position.x,
                  width: 0,
                  height: 0,
                }}
              />
            </Menu.Target>

            <Menu.Dropdown>
              {menuState.items.map((item, index) => {
                if (item.type === 'divider') {
                  return <Menu.Divider key={`divider-${index}`} />;
                }

                if (item.type === 'label') {
                  return <Menu.Label key={`label-${index}`}>{item.label}</Menu.Label>;
                }

                // Regular menu item
                return (
                  <Menu.Item
                    key={`item-${index}`}
                    leftSection={item.icon}
                    onClick={() => {
                      item.onClick();
                      hide();
                    }}
                    disabled={item.disabled}
                    color={item.color}
                    rightSection={
                      item.shortcut ? (
                        <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                          {item.shortcut}
                        </span>
                      ) : undefined
                    }
                  >
                    {item.label}
                  </Menu.Item>
                );
              })}
            </Menu.Dropdown>
          </Menu>
        </div>
      )}
    </ContextMenuContext.Provider>
  );
}

