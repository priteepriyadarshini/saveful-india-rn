// import React, { createContext, useContext, useState } from 'react';

// //const CurrentRouteContext = createContext<any>('');
// type CurrentRouteContextType = {
//   newCurrentRoute: string;
//   updateCurrentRoute: (newRoute: string) => void;
// };

// // ✅ Pracovide a default object with no-op function
// const CurrentRouteContext = createContext<CurrentRouteContextType>({
//   newCurrentRoute: '',
//   updateCurrentRoute: () => {},
// });

// export const CurrentRouteProvider = ({ children }: any) => {
//   const [newCurrentRoute, setNewCurrentRoute] = useState('');

//   const updateCurrentRoute = (newRoute: string) => {
//     setNewCurrentRoute(newRoute);
//   };

//   return (
//     <CurrentRouteContext.Provider
//       value={{ newCurrentRoute, updateCurrentRoute }}
//     >
//       {children}
//     </CurrentRouteContext.Provider>
//   );
// };

// export const useCurentRoute = () => {
//   return useContext(CurrentRouteContext);
// };


import React, { createContext, useContext, useState } from 'react';

const CurrentRouteContext = createContext<any>('');

export const CurrentRouteProvider = ({ children }: any) => {
  const [newCurrentRoute, setNewCurrentRoute] = useState('');

  const updateCurrentRoute = (newRoute: string) => {
    setNewCurrentRoute(newRoute);
  };

  return (
    <CurrentRouteContext.Provider
      value={{ newCurrentRoute, updateCurrentRoute }}
    >
      {children}
    </CurrentRouteContext.Provider>
  );
};

export const useCurentRoute = () => {
  return useContext(CurrentRouteContext);
};
