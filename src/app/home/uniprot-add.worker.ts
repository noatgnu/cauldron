/// <reference lib="webworker" />
import * as txtReader from 'txt-reader';


addEventListener('message', (data: MessageEvent<{
  msg: string,
  data: {from: string, to: string, column: string, selectedUniProtColumns: string[]},
  file: {checked: boolean, file: File, path: string, name: string, isTabular: boolean, isFasta: boolean}
}> ) => {
  const uniprotColumns = data.data.data.selectedUniProtColumns.join(',');
  const fromKey = data.data.data.from;
  const toKey = data.data.data.to;
  const reader = new txtReader.TxtReader();
  const file = data.data.file.file;


  console.log(uniprotColumns)

  const response = `received`;

  postMessage(response);
});
