import firebase from "firebase/app"; // Firebase core
import "firebase/firestore";
import "firebase/performance";
import { firebaseConfigSplit as firebaseConfig } from "./shared/firebase-config";
import { renderPage, logPerformance } from "./shared/helpers";

// STEPS
// 1) Import Firebase components
// 2) Subscribe to Firestore
// 3) Render data

firebase.initializeApp(firebaseConfig);
firebase.performance(); // Use Firebase Performance - 1 line
let firstLoad = false;

// Subscribe to stock data from Firestore and render page on updates.
subscribeToFirestore((stockData) => renderPage({
  title: "Importing Firestore and Perf Only",
  tableData: stockData
}));








/**
 * FUNCTIONS
 */

// Begin `onSnapshot` subscription to "current" collection in Firestore.
function subscribeToFirestore(renderFn) {
  firebase
    .firestore()
    .collection(`current`)
    .onSnapshot(snap => {
      if (!firstLoad) {
        // Measure time between navigation start and now (first data loaded)
        performance && performance.measure('initialDataLoadTime');
        // Log to console for internal development
        logPerformance();
        firstLoad = true;
      }
      const stocks = formatSDKStocks(snap);
      renderFn(stocks);
    });
}

// Format stock data in Firestore format (returned from `onSnapshot()`)
function formatSDKStocks(snap) {
  const stocks = [];
  snap.forEach(docSnap => {
    if (!docSnap.data()) return;
    const symbol = docSnap.id;
    const value = docSnap.data().closeValue;
    stocks.push({
      symbol,
      value,
      delta: docSnap.data().delta,
      timestamp: docSnap.data().timestamp
    });
  });
  return stocks;
}
