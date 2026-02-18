import { NextResponse } from 'next/server';
import { getPortfolio, portfolios } from '@/config/portfolios';
import { getPortfolioHoldings } from '@/lib/sheets';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const { portfolioId } = await params;
    const portfolio = getPortfolio(portfolioId);
    
    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: `Portfolio not found: ${portfolioId}` },
        { status: 404 }
      );
    }
    
    const holdings = await getPortfolioHoldings(portfolio.tabName);
    
    return NextResponse.json({
      success: true,
      data: {
        ...portfolio,
        holdings
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
