import * as React from 'react';
import { Html, Head, Preview, Body, Container, Section, Text, Button, Img, Heading, Hr } from '@react-email/components';
import { useTranslation } from "react-i18next";

const PRIMARY_COLOR = '#6d28d9'; // Purple-700
const LOGO_URL = 'https://glamzo.pt/logo.png'; // Placeholder fallback until real logo used

const mainStyles = {
  backgroundColor: '#f9fafb',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const containerStyles = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '40px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  maxWidth: '600px',
};

const logoStyles = {
  margin: '0 auto 24px',
  display: 'block',
  height: '40px',
};

const headingStyles = {
  color: '#111827',
  fontSize: '24px',
  fontWeight: '600',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const textStyles = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
};

const buttonStyles = {
  backgroundColor: PRIMARY_COLOR,
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  fontWeight: '500',
  margin: '32px auto',
  width: 'fit-content',
};


const infoCardStyles = {
  backgroundColor: '#f3f4f6',
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '24px',
};

const hrStyles = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footerStyles = {
  color: '#9ca3af',
  fontSize: '14px',
  textAlign: 'center' as const,
};

// 1. Verificação de Email
export const VerificationCodeEmail = ({ userName, code }: { userName: string, code: string }) => {
  const { t } = useTranslation();
  return  (
  <Html>
    <Head />
    <Preview>{t('txt_o_teu_c_digo_de_verifica_o_gla') || 'O teu código de verificação Glamzo'}</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: PRIMARY_COLOR}}>{t('txt_glamzo_64') || 'Glamzo'}</Heading>
        <Heading style={headingStyles}>{t('txt_bem_vindo_a') || 'Bem-vindo(a),'} {userName}!</Heading>
        <Text style={textStyles}>
          
                              {t('txt_obrigado_por_te_registares_na') || 'Obrigado por te registares na Glamzo. Para garantirmos a segurança da tua conta e poderes continuar com o registo, introduz o seguinte código de verificação:'}
                            </Text>
        <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px', textAlign: 'center', margin: '24px 0' }}>
          <Text style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '8px', margin: '0', color: PRIMARY_COLOR }}>
            {code}
          </Text>
        </div>
        <Text style={{...textStyles, fontSize: '14px', color: '#6b7280'}}>
          
                              {t('txt_este_c_digo_v_lido_apenas_para') || 'Este código é válido apenas para o processo de registo atual.'}
                            </Text>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>{t('txt_a_equipa_glamzo') || 'A equipa Glamzo'}</Text>
      </Container>
    </Body>
  </Html>
);
};

export const VerificationEmail = ({ userName, confirmationLink }: { userName: string, confirmationLink: string }) => {
  const { t } = useTranslation();
  return  (
  <Html>
    <Head />
    <Preview>{t('txt_confirma_o_teu_email_na_glamzo') || 'Confirma o teu email na Glamzo'}</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: PRIMARY_COLOR}}>{t('txt_glamzo_65') || 'Glamzo'}</Heading>
        <Heading style={headingStyles}>{t('txt_bem_vindo_a') || 'Bem-vindo(a),'} {userName}!</Heading>
        <Text style={textStyles}>
          
                              {t('txt_obrigado_por_te_registares_na_2') || 'Obrigado por te registares na Glamzo. Para garantirmos a segurança da tua conta e desbloquear todas as funcionalidades, precisamos que confirmes o teu endereço de email.'}
                            </Text>
        <Button href={confirmationLink} style={buttonStyles}>{t('txt_confirmar_email') || 'Confirmar Email'}</Button>
        <Text style={{...textStyles, fontSize: '14px', color: '#6b7280'}}>
          
                              {t('txt_nota_contas_n_o_verificadas_n') || 'Nota: Contas não verificadas não podem realizar marcações. Este link tem uma validade limitada.'}
                            </Text>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>{t('txt_a_equipa_glamzo') || 'A equipa Glamzo'}</Text>
      </Container>
    </Body>
  </Html>
);
};

// 2. Recuperação de Palavra-passe
export const PasswordResetEmail = ({ resetLink }: { resetLink: string }) => {
  const { t } = useTranslation();
  return  (
  <Html>
    <Head />
    <Preview>{t('txt_recupera_o_de_palavra_passe_gl') || 'Recuperação de Palavra-passe - Glamzo'}</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: PRIMARY_COLOR}}>{t('txt_glamzo_66') || 'Glamzo'}</Heading>
        <Heading style={headingStyles}>{t('txt_recuperar_palavra_passe') || 'Recuperar Palavra-passe'}</Heading>
        <Text style={textStyles}>
          
                              {t('txt_recebemos_um_pedido_para_repor') || 'Recebemos um pedido para repor a palavra-passe da tua conta Glamzo. Clica no botão abaixo para criar uma nova palavra-passe.'}
                            </Text>
        <Button href={resetLink} style={buttonStyles}>{t('txt_redefinir_palavra_passe') || 'Redefinir Palavra-passe'}</Button>
        <Text style={{...textStyles, fontSize: '14px', color: '#6b7280'}}>
          
                              {t('txt_se_n_o_fizeste_este_pedido_pod') || 'Se não fizeste este pedido, podes ignorar este email. O link é seguro e irá expirar brevemente.'}
                            </Text>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>{t('txt_a_equipa_glamzo') || 'A equipa Glamzo'}</Text>
      </Container>
    </Body>
  </Html>
);
};

// 3. Marcação Confirmada
export const BookingConfirmationEmail = ({ shopName, serviceName, professionalName, date, time, price, reference }: any) => {
  const { t } = useTranslation();
  return  (
  <Html>
    <Head />
    <Preview>{t('txt_a_tua_marca_o_est_confirmada') || 'A tua marcação está confirmada!'}</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: PRIMARY_COLOR}}>{t('txt_glamzo_67') || 'Glamzo'}</Heading>
        <Heading style={headingStyles}>{t('txt_marca_o_confirmada_3') || 'Marcação Confirmada ✅'}</Heading>
        <Text style={textStyles}>{t('txt_a_tua_reserva_no_sal_o') || 'A tua reserva no salão'} <strong>{shopName}</strong>  {t('txt_foi_confirmada_com_sucesso') || 'foi confirmada com sucesso.'}</Text>
        
        <Section style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t('txt_servi_o') || 'Serviço:'}</strong> {serviceName}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t('txt_profissional') || 'Profissional:'}</strong> {professionalName || 'Qualquer um'}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t('txt_data') || 'Data:'}</strong> {date}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t('txt_hora') || 'Hora:'}</strong> {time}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t('txt_valor') || 'Valor:'}</strong> {price}</Text>
          <Text style={{...textStyles, margin: '4px 0', fontSize: '12px', color: '#6b7280'}}>{t('txt_refer_ncia') || 'Referência:'} {reference}</Text>
        </Section>
        
        <Text style={textStyles}>{t('txt_podes_consultar_os_detalhes_e') || 'Podes consultar os detalhes e gerir a tua marcação na app.'}</Text>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>{t('txt_a_equipa_glamzo') || 'A equipa Glamzo'}</Text>
      </Container>
    </Body>
  </Html>
);
};

// 4. Marcação Cancelada
export const BookingCancelledEmail = ({ shopName, serviceName, date, time, reason }: any) => {
  const { t } = useTranslation();
  return  (
  <Html>
    <Head />
    <Preview>{t('txt_a_tua_marca_o_foi_cancelada') || 'A tua marcação foi cancelada'}</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: '#ef4444'}}>{t('txt_glamzo_68') || 'Glamzo'}</Heading>
        <Heading style={headingStyles}>{t('txt_marca_o_cancelada') || 'Marcação Cancelada ❌'}</Heading>
        <Text style={textStyles}>{t('txt_informamos_que_a_tua_reserva_n') || 'Informamos que a tua reserva no salão'} <strong>{shopName}</strong>  {t('txt_foi_cancelada') || 'foi cancelada.'}</Text>
        
        <Section style={{ borderLeft: '4px solid #e5e7eb', paddingLeft: '16px', marginBottom: '24px' }}>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t('txt_servi_o') || 'Serviço:'}</strong> {serviceName}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t('txt_data') || 'Data:'}</strong> {date}  {t('txt_s') || 'às'} {time}</Text>
          {reason && <Text style={{...textStyles, margin: '12px 0 4px', color: '#ef4444'}}><strong>{t('txt_motivo') || 'Motivo:'}</strong> {reason}</Text>}
        </Section>
        
        <Text style={textStyles}>{t('txt_se_tiveres_d_vidas_entra_em_co') || 'Se tiveres dúvidas, entra em contacto com o salão ou agenda um novo horário.'}</Text>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>{t('txt_a_equipa_glamzo') || 'A equipa Glamzo'}</Text>
      </Container>
    </Body>
  </Html>
);
};

// 5. Nova Marcação Recebida (Parceiro)
export const NewBookingEmail = ({ customerName, serviceName, date, time, price }: any) => {
  const { t } = useTranslation();
  return  (
  <Html>
    <Head />
    <Preview>{t('txt_nova_marca_o_na_glamzo') || 'Nova marcação na Glamzo'}</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: PRIMARY_COLOR}}>{t('txt_glamzo_pro') || 'Glamzo PRO'}</Heading>
        <Heading style={headingStyles}>{t('txt_nova_reserva_recebida') || 'Nova Reserva Recebida! 🎉'}</Heading>
        <Text style={textStyles}>{t('txt_o_cliente') || 'O cliente'} <strong>{customerName}</strong>  {t('txt_acabou_de_efetuar_uma_marca_o') || 'acabou de efetuar uma marcação.'}</Text>
        
        <Section style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t('txt_servi_o') || 'Serviço:'}</strong> {serviceName}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t('txt_data') || 'Data:'}</strong> {date}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t('txt_hora') || 'Hora:'}</strong> {time}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t('txt_valor_estimado') || 'Valor Estimado:'}</strong> {price}</Text>
        </Section>
        
        <Text style={textStyles}>{t('txt_consulta_a_tua_agenda_na_plata') || 'Consulta a tua agenda na plataforma para mais detalhes.'}</Text>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>{t('txt_glamzo_parceiros') || 'Glamzo Parceiros'}</Text>
      </Container>
    </Body>
  </Html>
);
};

// 6. Subscrição Glamzo PRO Ativada (Parceiro)
export const SubscriptionActivatedEmail = ({ planName, activationDate, nextBillingDate, dashboardUrl }: any) => {
  const { t } = useTranslation();
  return  (
  <Html>
    <Head />
    <Preview>{t('txt_bem_vindo_ao') || 'Bem-vindo ao'} {planName}!</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: PRIMARY_COLOR}}>{planName}</Heading>
        <Heading style={headingStyles}>{t('txt_subscri_o_ativa') || 'Subscrição Ativa 🚀'}</Heading>
        <Text style={textStyles}>{t('txt_a_sua_subscri_o_ao') || 'A sua subscrição ao'} <strong>{planName}</strong>  {t('txt_foi_ativada_com_sucesso') || 'foi ativada com sucesso!'}</Text>
        
        <Section style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t('txt_ativa_o') || 'Ativação:'}</strong> {activationDate}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t('txt_pr_xima_cobran_a') || 'Próxima Cobrança:'}</strong> {nextBillingDate}</Text>
        </Section>
        
        <Text style={textStyles}>{t('txt_j_tens_acesso_imediato_a_todas') || 'Já tens acesso imediato a todas as funcionalidades avançadas de gestão e marketing.'}</Text>
        <Button href={dashboardUrl} style={buttonStyles}>{t('txt_abrir_dashboard_pro') || 'Abrir Dashboard PRO'}</Button>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>{t('txt_equipa_de_sucessoglamzo') || 'Equipa de SucessoGlamzo'}</Text>
      </Container>
    </Body>
  </Html>
);
};

// 7. Fatura da Subscrição (Parceiro)
export const InvoiceEmail = ({ planName = "Glamzo PRO", amount, date, invoiceNumber, downloadUrl }: any) => {
  const { t } = useTranslation();
  return  (
  <Html>
    <Head />
    <Preview>{t('txt_fatura_da_subscri_o_glamzo') || 'Fatura da Subscrição Glamzo:'} {invoiceNumber}</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: PRIMARY_COLOR}}>{planName}</Heading>
        <Heading style={headingStyles}>{t('txt_acesso_sua_fatura') || 'Acesso à sua Fatura'}</Heading>
        <Text style={textStyles}>{t('txt_o_pagamento_da_sua_subscri_o_f') || 'O pagamento da sua subscrição foi processado com sucesso. A fatura já se encontra disponível.'}</Text>
        
        <Section style={{ padding: '16px 0', marginBottom: '16px' }}>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t('txt_data') || 'Data:'}</strong> {date}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t('txt_n_fatura') || 'Nº Fatura:'}</strong> {invoiceNumber}</Text>
          <Text style={{...textStyles, margin: '4px 0'}}><strong>{t('txt_valor_pago') || 'Valor Pago:'}</strong> {amount}</Text>
        </Section>
        
        <Button href={downloadUrl} style={buttonStyles}>{t('txt_download_da_fatura') || 'Download da Fatura'}</Button>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>{t('txt_departamento_financeiro_glamzo') || 'Departamento Financeiro Glamzo'}</Text>
      </Container>
    </Body>
  </Html>
);
};

// 8. Falha de Pagamento (Parceiro)
export const PaymentFailedEmail = ({ planName = "Glamzo PRO", explanation, updatePaymentUrl, suspensionDate }: any) => {
  const { t } = useTranslation();
  return  (
  <Html>
    <Head />
    <Preview>{t('txt_aviso_falha_no_pagamento_da_su') || 'Aviso: Falha no pagamento da subscrição'}</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={{...headingStyles, color: '#ef4444'}}>{planName}</Heading>
        <Heading style={headingStyles}>{t('txt_m_todo_de_pagamento_recusado') || 'Método de Pagamento Recusado ⚠️'}</Heading>
        <Text style={textStyles}>{t('txt_n_o_conseguimos_processar_a_re') || 'Não conseguimos processar a renovação da sua subscrição'} {planName}.</Text>
        <Text style={{...textStyles, backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '6px' }}>
          {explanation}
        </Text>
        
        <Text style={textStyles}>
          
                              {t('txt_por_favor_atualize_os_seus_dad') || 'Por favor, atualize os seus dados de pagamento antes de'} <strong>{suspensionDate}</strong>  {t('txt_para_evitar_a_suspens_o_do_ace') || 'para evitar a suspensão do acesso às funcionalidades do seu salão.'}
                            </Text>
        
        <Button href={updatePaymentUrl} style={buttonStyles}>{t('txt_atualizar_pagamento') || 'Atualizar Pagamento'}</Button>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>{t('txt_equipa_de_fatura_o_glamzo') || 'Equipa de Faturação Glamzo'}</Text>
      </Container>
    </Body>
  </Html>
);
};

export const StaffCredentialsEmail = ({ shopName, email, password, loginUrl }: { shopName: string, email: string, password: string, loginUrl: string }) => {
  const { t } = useTranslation();
  return  (
  <Html>
    <Head />
    <Preview>{t('txt_os_teus_dados_de_acesso_ao_gla') || 'Os teus dados de acesso ao Glamzo'}</Preview>
    <Body style={mainStyles}>
      <Container style={containerStyles}>
        <Heading style={headingStyles}>{t('txt_bem_vindo_equipa_do') || 'Bem-vindo à equipa do'} {shopName}!</Heading>
        <Text style={textStyles}>
          
                              {t('txt_a_tua_conta_foi_criada_com_suc') || 'A tua conta foi criada com sucesso. Podes aceder ao teu painel de funcionário no Glamzo usando as seguintes credenciais:'}
                            </Text>
        <Section style={infoCardStyles}>
          <Text style={{ margin: '0 0 8px 0', fontSize: '14px' }}><strong>{t('txt_email') || 'Email:'}</strong> {email}</Text>
          <Text style={{ margin: '0', fontSize: '14px' }}><strong>{t('txt_password') || 'Password:'}</strong> {password}</Text>
        </Section>
        <Button href={loginUrl} style={buttonStyles}>{t('txt_aceder_ao_painel') || 'Aceder ao Painel'}</Button>
        <Hr style={hrStyles} />
        <Text style={footerStyles}>{t('txt_se_n_o_esperavas_este_email_po') || 'Se não esperavas este email, podes ignorar.'}</Text>
      </Container>
    </Body>
  </Html>
);
};
