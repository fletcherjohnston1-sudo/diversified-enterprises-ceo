export interface Portfolio {
  id: string;
  name: string;
  sheetId: string;
  tabName: string;
  color: string;
}

export const portfolios: Portfolio[] = [
  {
    id: 'ai-infra',
    name: 'AI Infrastructure',
    sheetId: '11kk1KNHHxNNLgglS52mZt7-P5b-cH9ZPtv3FJHt8Dq0',
    tabName: 'AI Infra Dashboard',
    color: 'blue'
  },
  {
    id: 'blockchain',
    name: 'Blockchain',
    sheetId: '11kk1KNHHxNNLgglS52mZt7-P5b-cH9ZPtv3FJHt8Dq0',
    tabName: 'Block Chain Dashboard',
    color: 'purple'
  },
  {
    id: 'china',
    name: 'China',
    sheetId: '11kk1KNHHxNNLgglS52mZt7-P5b-cH9ZPtv3FJHt8Dq0',
    tabName: 'China Dashboard',
    color: 'red'
  }
];

export function getPortfolio(id: string): Portfolio | undefined {
  return portfolios.find(p => p.id === id);
}
