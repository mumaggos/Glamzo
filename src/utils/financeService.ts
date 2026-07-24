import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { realtimeService } from './realtimeService';
import { useTranslation } from "react-i18next";

export interface AdminCoupon {
  id: string;
  code: string;
  discount_type: 'percent' | 'flat';
  discount_value: number;
  limit_uses: number;
  uses_count: number;
  trial_days: number;
  created_at: string;
}

export interface PartnerSubscription {
  id: string;
  business_id: string;
  plan_name: 'FREE' | 'PRO';
  status: 'active' | 'trialing' | 'expired';
  monthly_price: number;
  started_at: string;
  expires_at: string;
  stripe_subscription_id: string | null;
  trial_ends_at?: string;
}

export interface PartnerPayout {
  id: string;
  business_id: string;
  business_name: string;
  amount: number;
  method: 'transfer' | 'mbway';
  destination_details: string;
  status: 'pending' | 'pago' | 'falhado';
  created_at: string;
  processed_at?: string;
}

export interface ClientRewardCode {
  id: string;
  customer_id: string;
  code: string;
  value: number; // 5 or 10
  used: boolean;
  used_at?: string;
  expires_at: string;
}

export interface CampaignDestaque {
  id: string;
  business_id: string;
  business_name: string;
  type: 'destaque' | 'boosted_search' | 'premium_placement';
  hours_duration: number;
  credits_cost: number;
  status: 'active' | 'completed';
  created_at: string;
  expires_at: string;
}

export interface DisputeReport {
  id: string;
  booking_id: string;
  business_id: string;
  business_name: string;
  customer_id: string;
  customer_name: string;
  opened_by: 'customer' | 'partner';
  reason: string;
  description: string;
  status: 'open' | 'resolved';
  admin_decision?: string;
  admin_reply?: string;
  created_at: string;
}

export const financeService = {
  // 1. Commission Split Accountant
  calculateSplit(basePrice: number, discount: number, isPro: boolean) {
    const feeRate = isPro ? 0.05 : 0.15; // Pro has 5% fee, Free has 15%
    const originalCommission = Number((basePrice * feeRate).toFixed(2));
    const businessAmount = Number((basePrice - originalCommission).toFixed(2)); // Business strictly gets their full base price minus original commission
    const clientPays = Math.max(0, Number((basePrice - discount).toFixed(2)));
    const glamzoFee = Number((clientPays - businessAmount).toFixed(2)); // Glamzo absorbs the discount, resulting in a lower/negative fee

    return {
      feeRate,
      originalCommission,
      businessAmount,
      clientPays,
      glamzoFee
    };
  },

  // 2. Coupon Admin Engine
  getAdminCoupons(): AdminCoupon[] {
    const list = localStorage.getItem('glamzo_admin_coupons');
    if (!list) {
      const initial: AdminCoupon[] = [];
      localStorage.setItem('glamzo_admin_coupons', JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(list);
  },

  createAdminCoupon(code: string, discountValue: number, discountType: 'percent' | 'flat', limitUses: number, trialDays: number): AdminCoupon {
    const list = this.getAdminCoupons();
    const newCoupon: AdminCoupon = {
      id: `cp_${Math.random().toString(36).substring(2, 9)}`,
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: discountValue,
      limit_uses: limitUses,
      uses_count: 0,
      trial_days: trialDays,
      created_at: new Date().toISOString()
    };
    list.unshift(newCoupon);
    localStorage.setItem('glamzo_admin_coupons', JSON.stringify(list));
    
    // Broadcast
    realtimeService.broadcast('coupon:created', newCoupon);
    return newCoupon;
  },

  // 3. Subscription Management for Partners
  getBusinessSubscription(businessId: string): PartnerSubscription {
    const list = localStorage.getItem('glamzo_partner_subscriptions');
    const subs: PartnerSubscription[] = list ? JSON.parse(list) : [];
    const found = subs.find(s => s.business_id === businessId);
    
    if (!found) {
      // Default to FREE tier
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      return {
        id: `sub_free_${businessId}`,
        business_id: businessId,
        plan_name: 'FREE',
        status: 'active',
        monthly_price: 0,
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        stripe_subscription_id: null
      };
    }
    return found;
  },

  activateProSubscription(businessId: string, couponCodeUsed?: string): PartnerSubscription {
    const list = localStorage.getItem('glamzo_partner_subscriptions');
    const subs: PartnerSubscription[] = list ? JSON.parse(list) : [];
    
    let trialDays = 0;
    if (couponCodeUsed) {
      const coupons = this.getAdminCoupons();
      const matched = coupons.find(c => c.code === couponCodeUsed.trim().toUpperCase());
      if (matched && matched.uses_count < matched.limit_uses) {
        trialDays = matched.trial_days;
        matched.uses_count += 1;
        localStorage.setItem('glamzo_admin_coupons', JSON.stringify(coupons));
      }
    }

    const expiresAt = new Date();
    if (trialDays > 0) {
      expiresAt.setDate(expiresAt.getDate() + trialDays);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    const subId = `sub_pro_${Math.random().toString(36).substring(2, 9)}`;
    const newSub: PartnerSubscription = {
      id: subId,
      business_id: businessId,
      plan_name: 'PRO',
      status: trialDays > 0 ? 'trialing' : 'active',
      monthly_price: trialDays > 0 ? 0.00 : 19.90,
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      stripe_subscription_id: `sub_stripe_${Math.random().toString(36).substring(2, 9)}`,
      trial_ends_at: trialDays > 0 ? expiresAt.toISOString() : undefined
    };

    const updated = subs.filter(s => s.business_id !== businessId);
    updated.push(newSub);
    localStorage.setItem('glamzo_partner_subscriptions', JSON.stringify(updated));

    // Grant 40 promotional credits as PRO default
    this.addCreditsToBusiness(businessId, 40);

    // Broadcast
    realtimeService.broadcast('subscription:activated', newSub);
    
    return newSub;
  },

  // 4. Partner balance and payouts
  getPartnerBalance(businessId: string): number {
    // Dynamically calculate from completed payments + simulation
    const initialBalance = Number(localStorage.getItem(`glamzo_partner_bal_${businessId}`) || '150.00');
    return Number(initialBalance.toFixed(2));
  },

  adjustPartnerBalance(businessId: string, amount: number) {
    const current = this.getPartnerBalance(businessId);
    const newBal = Math.max(0, current + amount);
    localStorage.setItem(`glamzo_partner_bal_${businessId}`, newBal.toString());
    realtimeService.broadcast('balance:updated', { businessId, balance: newBal });
  },

  getPayouts(businessId?: string): PartnerPayout[] {
    const list = localStorage.getItem('glamzo_payouts');
    const payouts: PartnerPayout[] = list ? JSON.parse(list) : [];
    
    if (businessId) {
      return payouts.filter(p => p.business_id === businessId);
    }
    return payouts;
  },

  requestPayout(businessId: string, businessName: string, amount: number, method: 'transfer' | 'mbway', details: string): PartnerPayout | string {
    const bal = this.getPartnerBalance(businessId);
    if (amount > bal) {
      return 'Saldo insuficiente para efetuar este levantamento.';
    }

    // Deduct from balance
    this.adjustPartnerBalance(businessId, -amount);

    const list = getPayoutsList();
    const payout: PartnerPayout = {
      id: `pay_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      business_id: businessId,
      business_name: businessName,
      amount,
      method,
      destination_details: details,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    list.unshift(payout);
    localStorage.setItem('glamzo_payouts', JSON.stringify(list));

    // Admin Notification
    realtimeService.addNotification(
      'admin',
      'admin',
      '💸 Novo Pedido de Payout',
      `O estabelecimento "${businessName}" solicitou um payout de ${amount.toFixed(2)}€ via ${method.toUpperCase()}.`
    );

    realtimeService.broadcast('payout:requested', payout);
    return payout;
  },

  updatePayoutStatus(payoutId: string, status: 'pago' | 'falhado'): PartnerPayout | null {
    const list = getPayoutsList();
    const pIdx = list.findIndex(p => p.id === payoutId);
    if (pIdx !== -1) {
      list[pIdx].status = status;
      list[pIdx].processed_at = new Date().toISOString();
      localStorage.setItem('glamzo_payouts', JSON.stringify(list));

      if (status === 'falhado') {
        // Return amount back to balance
        this.adjustPartnerBalance(list[pIdx].business_id, list[pIdx].amount);
      }

      // Notify partner
      realtimeService.addNotification(
        list[pIdx].business_id,
        'partner',
        status === 'pago' ? '✅ Transferência Concluída!' : '❌ Falha no Payout',
        `O seu pedido de payout no valor de ${list[pIdx].amount.toFixed(2)}€ foi processado como: ${status.toUpperCase()}.`
      );

      realtimeService.broadcast('payout:updated', list[pIdx]);
      return list[pIdx];
    }
    return null;
  },

  // 5. Customer Loyalty System
  getCustomerPoints(customerId: string): number {
    const pointsStr = localStorage.getItem(`glamzo_cust_points_${customerId}`);
    if (pointsStr === null) {
      // Seed initial points for onboarding customer
      localStorage.setItem(`glamzo_cust_points_${customerId}`, '0');
      return 0;
    }
    return Number(pointsStr);
  },

  addCustomerPoints(customerId: string, amount: number) {
    const current = this.getCustomerPoints(customerId);
    const updated = current + amount;
    localStorage.setItem(`glamzo_cust_points_${customerId}`, updated.toString());
    realtimeService.broadcast('points:updated', { customerId, points: updated });
  },

  redeemPointsForCoupon(customerId: string, pointsToRedeem: 500 | 1000): ClientRewardCode | string {
    const current = this.getCustomerPoints(customerId);
    if (current < pointsToRedeem) {
      return 'Pontos de fidelidade insuficientes para resgatar este voucher.';
    }

    this.addCustomerPoints(customerId, -pointsToRedeem);

    const discountVal = pointsToRedeem === 500 ? 5.00 : 10.00;
    const rewardsKey = `glamzo_rewards_${customerId}`;
    const rewardsList: ClientRewardCode[] = JSON.parse(localStorage.getItem(rewardsKey) || '[]');

    const exp = new Date();
    exp.setMonth(exp.getMonth() + 6); // 6 months validity

    const newReward: ClientRewardCode = {
      id: `rw_${Math.random().toString(36).substring(2, 9)}`,
      customer_id: customerId,
      code: `REWARD-${discountVal}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      value: discountVal,
      used: false,
      expires_at: exp.toISOString()
    };

    rewardsList.unshift(newReward);
    localStorage.setItem(rewardsKey, JSON.stringify(rewardsList));

    // Send automated email simulator for the loyalty reward dispatch
    realtimeService.sendEmailViaResend(
      'customer@glamzo.com',
      `O teu voucher de fidelidade ${newReward.code} está pronto! 🎟️`,
      'cupão',
      { couponCode: newReward.code }
    );

    return newReward;
  },

  getClientRewardCodes(customerId: string): ClientRewardCode[] {
    return JSON.parse(localStorage.getItem(`glamzo_rewards_${customerId}`) || '[]');
  },

  // 6. Partner Credits & Marketing Campaigns
  getBusinessCredits(businessId: string): number {
    const creditsStr = localStorage.getItem(`glamzo_partner_credits_${businessId}`);
    if (creditsStr === null) {
      // See if they are PRO subscriber to grant free 40 initial credits
      const sub = this.getBusinessSubscription(businessId);
      const initial = sub.plan_name === 'PRO' ? 40 : 10;
      localStorage.setItem(`glamzo_partner_credits_${businessId}`, initial.toString());
      return initial;
    }
    return Number(creditsStr);
  },

  addCreditsToBusiness(businessId: string, amount: number) {
    const current = this.getBusinessCredits(businessId);
    const updated = current + amount;
    localStorage.setItem(`glamzo_partner_credits_${businessId}`, updated.toString());
    realtimeService.broadcast('credits:updated', { businessId, credits: updated });
  },

  createCampaign(
    businessId: string, 
    businessName: string, 
    type: 'destaque' | 'boosted_search' | 'premium_placement', 
    hours: number
  ): CampaignDestaque | string {
    const costPerHour = type === 'destaque' ? 2 : type === 'premium_placement' ? 3 : 1;
    const cost = hours * costPerHour;
    const credits = this.getBusinessCredits(businessId);

    if (credits < cost) {
      return `Créditos insuficientes. Criar esta campanha de ${hours}h de ${type} custa ${cost} créditos (tens ${credits}).`;
    }

    this.addCreditsToBusiness(businessId, -cost);

    const list = getCampaignsList();
    const expires = new Date();
    expires.setHours(expires.getHours() + hours);

    const camp: CampaignDestaque = {
      id: `camp_${Math.random().toString(36).substring(2, 9)}`,
      business_id: businessId,
      business_name: businessName,
      type,
      hours_duration: hours,
      credits_cost: cost,
      status: 'active',
      created_at: new Date().toISOString(),
      expires_at: expires.toISOString()
    };

    list.unshift(camp);
    localStorage.setItem('glamzo_campaigns', JSON.stringify(list));

    // Mark business as verified/promoted dynamically
    try {
      localStorage.setItem(`glamzo_promoted_${businessId}`, 'true');
    } catch (_) {}

    realtimeService.broadcast('campaign:activated', camp);
    return camp;
  },

  getCampaigns(businessId?: string): CampaignDestaque[] {
    const list = getCampaignsList();
    if (businessId) {
      return list.filter(c => c.business_id === businessId);
    }
    return list;
  },

  // 7. General Disputes and reviews validation
  getDisputes(userId?: string): DisputeReport[] {
    const list = localStorage.getItem('glamzo_disputes_list');
    const disputes: DisputeReport[] = list ? JSON.parse(list) : [];
    if (userId) {
      return disputes.filter(d => d.customer_id === userId || d.business_id === userId);
    }
    return disputes;
  },

  openDispute(
    bookingId: string, 
    businessId: string, 
    businessName: string, 
    customerId: string, 
    customerName: string, 
    openedBy: 'customer' | 'partner', 
    reason: string, 
    description: string
  ): DisputeReport {
    const list = this.getDisputes();
    const newDispute: DisputeReport = {
      id: `disp_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      booking_id: bookingId,
      business_id: businessId,
      business_name: businessName,
      customer_id: customerId,
      customer_name: customerName,
      opened_by: openedBy,
      reason,
      description,
      status: 'open',
      created_at: new Date().toISOString()
    };
    list.unshift(newDispute);
    localStorage.setItem('glamzo_disputes_list', JSON.stringify(list));

    // Admin alerts
    realtimeService.addNotification(
      'admin',
      'admin',
      '⚠️ Nova Disputa Registada',
      `Disputa aberta para a reserva ${bookingId}. Motivo: "${reason}".`
    );

    realtimeService.broadcast('dispute:created', newDispute);
    return newDispute;
  },

  resolveDispute(disputeId: string, decision: 'refund' | 'payout_partner' | 'dismissed', reply: string): DisputeReport | null {
    const list = this.getDisputes();
    const dIdx = list.findIndex(d => d.id === disputeId);
    if (dIdx !== -1) {
      list[dIdx].status = 'resolved';
      list[dIdx].admin_decision = decision;
      list[dIdx].admin_reply = reply;

      localStorage.setItem('glamzo_disputes_list', JSON.stringify(list));

      // Actions based on decision
      if (decision === 'refund') {
        // refund customer
        realtimeService.addNotification(
          list[dIdx].customer_id,
          'customer',
          '💸 Reembolso de Disputa Aprovado',
          `A equipa de suporte Glamzo aprovou o reembolso correspondente à reserva ${list[dIdx].booking_id}.`
        );
      } else if (decision === 'payout_partner') {
        // confirm business payout
        realtimeService.addNotification(
          list[dIdx].business_id,
          'partner',
          '💼 Disputa Decidida a Favor',
          `A disputa para a reserva ${list[dIdx].booking_id} foi arbitrada a favor do estabelecimento.`
        );
      }

      realtimeService.broadcast('dispute:resolved', list[dIdx]);
      return list[dIdx];
    }
    return null;
  }
};

// Internal list access helpers
function getPayoutsList(): PartnerPayout[] {
  const list = localStorage.getItem('glamzo_payouts');
  if (!list) {
    // Seed default payouts
    const initial: PartnerPayout[] = [
      {
        id: 'PAY_FR456',
        business_id: 'b_1',
        business_name: 'Barbearia D’Elite',
        amount: 320.50,
        method: 'transfer',
        destination_details: 'PT50 0003 0456 1234 5678 9012 34',
        status: 'pago',
        created_at: '2026-05-12T14:20:00Z',
        processed_at: '2026-05-13T09:30:00Z'
      },
      {
        id: 'PAY_SD892',
        business_id: 'b_1',
        business_name: 'Barbearia D’Elite',
        amount: 85.00,
        method: 'mbway',
        destination_details: '+351 912 345 678',
        status: 'pending',
        created_at: new Date().toISOString()
      }
    ];
    localStorage.setItem('glamzo_payouts', JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(list);
}

function getCampaignsList(): CampaignDestaque[] {
  const list = localStorage.getItem('glamzo_campaigns');
  if (!list) {
    const initial: CampaignDestaque[] = [
      {
        id: 'camp_1',
        business_id: 'b_1',
        business_name: 'Barbearia D’Elite',
        type: 'destaque',
        hours_duration: 12,
        credits_cost: 24,
        status: 'active',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 12 * 3600 * 1000).toISOString()
      }
    ];
    localStorage.setItem('glamzo_campaigns', JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(list);
}
