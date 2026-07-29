import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { explorerTxUrl } from '@/lib/chains';

// Register standard fonts for better look if possible, but Helvetica/Courier are safe defaults.
// For a premium feel, we stick to clean weights.

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica',
    backgroundColor: '#020617', // Slate 950
    color: '#f8fafc',
  },
  mainContainer: {
    padding: 40,
    height: '100%',
  },
  // Background Decorations
  bgGlow: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 400,
    height: 400,
    backgroundColor: '#3730a3', // Indigo 800
    opacity: 0.1,
    borderRadius: 200,
  },
  bgGlowBottom: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 300,
    height: 300,
    backgroundColor: '#0e7490', // Cyan 700
    opacity: 0.08,
    borderRadius: 150,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 20,
  },
  companyInfo: {
    flexDirection: 'column',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#818cf8', // Indigo 400
    letterSpacing: 1,
  },
  subLogo: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  receiptTitle: {
    textAlign: 'right',
  },
  titleMain: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  titleSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },

  grid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
  },
  gridCol: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.5)', // Slate 800 with opacity
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridTitle: {
    fontSize: 9,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  gridValue: {
    fontSize: 12,
    color: '#f1f5f9',
    fontWeight: 'bold',
  },
  gridSubValue: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 4,
    fontFamily: 'Courier',
  },

  tableContainer: {
    marginTop: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  colDesc: { flex: 3 },
  colAmount: { flex: 1, textAlign: 'right' },
  headerText: { fontSize: 9, color: '#94a3b8', fontWeight: 'bold' },
  rowText: { fontSize: 11, color: '#e2e8f0' },
  rowTextDim: { fontSize: 10, color: '#64748b' },

  summaryBox: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)', // Indigo 500 transparent
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#818cf8',
    fontFamily: 'Courier',
  },

  blockchainSection: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)', // Cyan 400
    flexDirection: 'row',
    gap: 20,
  },
  qrCodeIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#ffffff',
    padding: 5,
    borderRadius: 8,
  },
  verificationDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  statusBadge: {
    backgroundColor: '#064e3b',
    color: '#34d399', // Emerald 400
    fontSize: 8,
    padding: '3 8',
    borderRadius: 100,
    width: 100,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  hashLabel: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 4,
  },
  hashValue: {
    fontSize: 9,
    color: '#22d3ee', // Cyan 400
    fontFamily: 'Courier',
    marginBottom: 8,
  },
  verificationFooterText: {
    fontSize: 8,
    color: '#94a3b8',
    fontStyle: 'italic',
  },

  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#475569',
    lineHeight: 1.5,
  }
});

interface PayslipData {
  txHash: string;
  employeeName: string;
  amount: number;
  date: string;
  /** Gas the employer paid for this transfer, in ETH. */
  networkFee?: number;
  /** ETH/USD rate at the time of the transaction. */
  usdRate?: number;
}

export const PayslipPDF = ({ txHash, employeeName, amount, date, networkFee = 0, usdRate = 0 }: PayslipData) => {
  const baseSalary = amount;
  // Gas comes out of the employer's wallet on top of the transfer, so the
  // employee receives the full salary amount.
  const netPayment = baseSalary;
  const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const explorerUrl = explorerTxUrl(txHash);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(explorerUrl)}&size=150x150&color=06b6d4&bgcolor=ffffff`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.bgGlow} />
        <View style={styles.bgGlowBottom} />
        
        <View style={styles.mainContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.companyInfo}>
              <Text style={styles.logoText}>PaySlip</Text>
              <Text style={styles.subLogo}>Decentralized Payroll</Text>
            </View>
            <View style={styles.receiptTitle}>
              <Text style={styles.titleMain}>Earnings Statement</Text>
              <Text style={styles.titleSub}>Period: {formattedDate}</Text>
            </View>
          </View>

          {/* Info Grid */}
          <View style={styles.grid}>
            <View style={styles.gridCol}>
              <Text style={styles.gridTitle}>Employee Name</Text>
              <Text style={styles.gridValue}>{employeeName}</Text>
              <Text style={styles.gridSubValue}>Verified ID: {employeeName.replace(/\s+/g, '-').toLowerCase()}</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.gridTitle}>Issued Date</Text>
              <Text style={styles.gridValue}>{date}</Text>
              <Text style={styles.gridSubValue}>Network: Robinhood Chain Testnet</Text>
            </View>
          </View>

          {/* Breakdown Table */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <View style={styles.colDesc}><Text style={styles.headerText}>DESCRIPTION</Text></View>
              <View style={styles.colAmount}><Text style={styles.headerText}>AMOUNT (ETH)</Text></View>
            </View>
            
            <View style={styles.tableRow}>
              <View style={styles.colDesc}>
                <Text style={styles.rowText}>Salary Disbursement</Text>
                <Text style={styles.rowTextDim}>Monthly base payment in native asset</Text>
              </View>
              <View style={styles.colAmount}><Text style={styles.rowText}>{baseSalary.toFixed(2)}</Text></View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.colDesc}>
                <Text style={styles.rowText}>Network Fees (Sponsored)</Text>
                <Text style={styles.rowTextDim}>Gas paid by the employer on Robinhood Chain — not deducted from this payment</Text>
              </View>
              <View style={styles.colAmount}><Text style={styles.rowText}>{networkFee.toFixed(6)}</Text></View>
            </View>

            <View style={{ ...styles.tableRow, borderBottomWidth: 0 }}>
              <View style={styles.colDesc}>
                <Text style={styles.rowTextDim}>Estimated USD Value (at time of tx)</Text>
              </View>
              <View style={styles.colAmount}><Text style={styles.rowTextDim}>~$ {(baseSalary * usdRate).toFixed(2)} USD</Text></View>
            </View>
          </View>

          {/* Summary */}
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>NET DISBURSEMENT</Text>
            <Text style={styles.summaryValue}>{netPayment.toFixed(5)} ETH</Text>
          </View>

          {/* Blockchain Verification Section */}
          <View style={styles.blockchainSection}>
            <View style={styles.qrCodeIcon}>
              {txHash && <Image src={qrUrl} />}
            </View>
            <View style={styles.verificationDetails}>
              <View style={styles.statusBadge}>
                <Text>CONFIRMED</Text>
              </View>
              <Text style={styles.hashLabel}>BLOCKCHAIN TRANSACTION HASH</Text>
              <Text style={styles.hashValue}>{txHash || "PENDING_CONFIRMATION_ON_LEDGER"}</Text>
              <Text style={styles.verificationFooterText}>
                Scan QR code to view this transaction on the public Robinhood Chain ledger.
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              This is a digital receipt of a blockchain transaction. PaySlip is a non-custodial payroll layer on the Robinhood Chain Network.
              Values are cryptographically verifiable and immutable once recorded on the ledger.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

