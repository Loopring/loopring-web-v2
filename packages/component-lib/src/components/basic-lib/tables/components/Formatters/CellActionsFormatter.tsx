// // import { useState } from 'react';
// // import type { ReactNode } from 'react';
// // import clsx from 'clsx';
// // import { usePopper } from 'react-popper';
// // import { createPortal } from 'react-dom';
// import styled from "@emotion/styled";;
// //
// // const CellActionClassname = styled.div`
// //   float: right;
// // `;
// //
// // const CellActionLastClassname = styled.div`
// //   margin-right: -8px;
// // `;
//
// // const CellActionButtonClassname = styled.div`
// //   width: 35px;
// //   height: 100%;
// //   text-align: center;
// //   position: relative;
// //   display: table;
// //   color: #4a9de2;
// //
// //   > span {
// //     display: table-cell;
// //     vertical-align: middle;
// //   }
// // `;
//
// const CellActionMenuClassname = styled.div`
//   position: absolute;
//   top: 100%;
//   z-index: 1000;
//   float: left;
//   min-width: 160px;
//   padding: 5px 0;
//   text-align: left;
//   list-style: none;
//   background-
//   background-clip: padding-box;
//   border: 1px solid #ccc;
//   box-shadow: 0 0 3px 0 #ccc;
//
//   > span {
//     display: block;
//     padding: 3px 10px;
//     clear: both;
//     font-weight: 400;
//     line-height: 1.42857143;
//     color: #333;
//     white-space: nowrap;
//     cursor: pointer;
//
//     &:hover {
//       color: #262626;
//       text-decoration: none;
//       background-color: #f5f5f5;
//     }
//   }
// `;
//
// // interface Action {
// //   text: ReactNode;
// //   callback: () => void;
// // }
//
// // interface CellActionButton {
// //   icon: ReactNode;
// //   actions?: Action[];
// //   callback?: () => void;
// // }
//
// // interface CellActionProps extends CellActionButton {
// //   isFirst: boolean;
// // }
// //
// // function CellAction({ icon, actions, callback, isFirst }: CellActionProps) {
// //   const [isOpen, setIsOpen] = useState(false);
// //   const [reference, setReference] = useState<HTMLDivElement | undefined>(undefined);
// //   const [popper, setPopper] = useState<HTMLDivElement | undefined>(undefined);
// //   const { styles } = usePopper(reference, popper, {
// //     placement: 'bottom-start',
// //     modifiers: [{ name: 'offset', options: { offset: [0, -8] } }]
// //   });
// //
// //   const cellActionClasses = clsx(CellActionMenuClassname, {
// //     [CellActionLastClassname]: isFirst
// //   });
// //
// //   function onActionIconClick() {
// //     if (typeof callback === 'function') {
// //       callback();
// //     }
// //
// //     if (actions && actions.length > 0) {
// //       setIsOpen(isOpen => !isOpen);
// //     }
// //   }
// //
// //   return (
// //     <div className={cellActionClasses} onMouseLeave={() => setIsOpen(false)}>
// //       <CellActionClassname ref={setReference} onClick={onActionIconClick}>
// //         {icon}
// //       </CellActionClassname>
// //       {isOpen && actions && actions.length && createPortal(
// //         <CellActionMenuClassname ref={setPopper} style={styles.popper}>
// //           {actions.map((action, index) => <span key={index} onClick={action.callback}>{action.text}</span>)}
// //         </CellActionMenuClassname>,
// //         document.body
// //       )}
// //     </div>
// //   );
// // }
// //
// // interface CellActionsFormatterProps {
// //   actions: CellActionButton[];
// // }
// //
// // export function CellActionsFormatter({ actions }: CellActionsFormatterProps) {
// //   const actionButtons = actions.map((action, index) => {
// //     return <CellAction key={index} isFirst={index === 0} {...action} />;
// //   });
// //
// //   return <>{actionButtons}</>;
// // }
export default {}
