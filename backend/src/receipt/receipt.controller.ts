/**
 * ==============================================
 * VARLIXO - RECEIPT CONTROLLER
 * ==============================================
 * Handles receipt generation and management endpoints.
 */

import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
  Response,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ReceiptService } from './receipt.service';
import { createReadStream } from 'fs';
import { join } from 'path';

@ApiTags('receipts')
@Controller('receipts')
@UseGuards(JwtAuthGuard)
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  /**
   * Generate receipt for transaction
   */
  @Post('generate/:transactionId')
  @ApiOperation({ summary: 'Generate receipt for transaction' })
  @ApiResponse({ status: 200, description: 'Receipt generated successfully' })
  async generateReceipt(
    @Param('transactionId') transactionId: string,
    @CurrentUser('sub') userId: string,
    @Request() req: Request,
  ) {
    try {
      const receipt = await this.receiptService.generateReceipt(
        transactionId,
        'Admin Dashboard',
      );

      return {
        success: true,
        message: 'Receipt generated successfully',
        data: receipt,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  /**
   * Get user receipts
   */
  @Get('my-receipts')
  @ApiOperation({ summary: 'Get user receipts' })
  @ApiResponse({ status: 200, description: 'User receipts retrieved successfully' })
  async getUserReceipts(
    @CurrentUser('sub') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const receipts = await this.receiptService.getUserReceipts(
        userId,
        page || 1,
        limit || 10,
      );

      return {
        success: true,
        message: 'Receipts retrieved successfully',
        data: receipts,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  /**
   * Get receipt by ID
   */
  @Get(':receiptId')
  @ApiOperation({ summary: 'Get receipt by ID' })
  @ApiResponse({ status: 200, description: 'Receipt retrieved successfully' })
  async getReceipt(
    @Param('receiptId') receiptId: string,
    @CurrentUser('sub') userId: string,
  ) {
    try {
      const receipt = await this.receiptService.getReceiptById(receiptId);

      return {
        success: true,
        message: 'Receipt retrieved successfully',
        data: receipt,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  /**
   * Download receipt PDF
   */
  @Get('download/:receiptId')
  @ApiOperation({ summary: 'Download receipt PDF' })
  @ApiResponse({ status: 200, description: 'Receipt downloaded successfully' })
  async downloadReceipt(
    @Param('receiptId') receiptId: string,
    @CurrentUser('sub') userId: string,
    @Response() res: Response,
  ) {
    try {
      const receipt = await this.receiptService.downloadReceipt(receiptId, userId);

      // Generate PDF (simplified version - you can enhance with a proper PDF library)
      const pdfContent = this.generatePDF(receipt);

      // Set headers for PDF download
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${receipt.receiptNumber}.pdf"`,
        'Content-Length': pdfContent.length,
      });

      res.send(pdfContent);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Auto-generate receipts for all completed transactions
   */
  @Post('auto-generate')
  @ApiOperation({ summary: 'Auto-generate receipts for completed transactions' })
  @ApiResponse({ status: 200, description: 'Auto-generation started' })
  async autoGenerateReceipts() {
    try {
      await this.receiptService.autoGenerateReceipts();

      return {
        success: true,
        message: 'Auto-generation started for all completed transactions',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Generate simple PDF content
   * Note: This is a basic HTML-to-PDF conversion
   * You can enhance this with a proper PDF library like puppeteer
   */
  private generatePDF(receipt: any): Buffer {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transaction Receipt - ${receipt.receiptNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .receipt-details { max-width: 600px; margin: 0 auto; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .detail-label { font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>VARLIXO TRANSACTION RECEIPT</h1>
          <p>Receipt Number: ${receipt.receiptNumber}</p>
          <p>Date: ${new Date(receipt.issuedAt).toLocaleDateString()}</p>
        </div>
        
        <div class="receipt-details">
          <div class="detail-row">
            <span class="detail-label">Transaction Type:</span>
            <span>${receipt.transactionType.toUpperCase()}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment Method:</span>
            <span>${receipt.paymentMethod}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount:</span>
            <span>$${receipt.amount.toFixed(2)} ${receipt.currency}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Fee:</span>
            <span>$${receipt.fee.toFixed(2)} ${receipt.currency}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Net Amount:</span>
            <span>$${receipt.netAmount.toFixed(2)} ${receipt.currency}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Transaction Reference:</span>
            <span>${receipt.transactionRef}</span>
          </div>
          ${receipt.txHash ? `
          <div class="detail-row">
            <span class="detail-label">Transaction Hash:</span>
            <span>${receipt.txHash}</span>
          </div>
          ` : ''}
          ${receipt.fromAddress ? `
          <div class="detail-row">
            <span class="detail-label">From Address:</span>
            <span>${receipt.fromAddress}</span>
          </div>
          ` : ''}
          ${receipt.toAddress ? `
          <div class="detail-row">
            <span class="detail-label">To Address:</span>
            <span>${receipt.toAddress}</span>
          </div>
          ` : ''}
          <div class="detail-row">
            <span class="detail-label">Description:</span>
            <span>${receipt.description}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>This receipt is automatically generated by Varlixo Investment Platform</p>
          <p>Issued by: ${receipt.issuedBy}</p>
        </div>
      </body>
      </html>
    `;

    // Simple HTML to PDF conversion (you might want to use a proper PDF library)
    // For now, returning HTML as buffer - browser will render it
    return Buffer.from(htmlContent, 'utf-8');
  }
}
