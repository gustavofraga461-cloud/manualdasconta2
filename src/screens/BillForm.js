import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Modal, Alert, StyleSheet } from 'react-native';
import { C, categories } from '../theme';
import { generateOccurrences } from '../utils/dates';

const Field = ({ label, ...props }) => <View style={s.field}><Text style={s.label}>{label}</Text><TextInput placeholderTextColor={C.muted} style={s.input} {...props}/></View>;
const Chip = ({ selected, children, onPress }) => <Pressable onPress={onPress} style={[s.chip, selected && s.chipSelected]}><Text style={[s.chipText, selected && {color:C.white}]}>{children}</Text></Pressable>;

export default function BillForm({ visible, initial, onClose, onSave }) {
  const blank = { title:'', amount:'', category:'Moradia', dueDate:new Date().toISOString().slice(0,10), recurrence:'once', installments:'12', endDate:'', paymentCode:'', notes:'', notifyDays:'1', notifyTime:'08:00' };
  const [form,setForm] = useState(blank);
  useEffect(() => {
    if (visible) setForm(initial ? { ...blank, ...initial, amount:String(initial.amount), recurrence: initial.recurrence || 'once', notifyDays:String(initial.notifyDays ?? 1) } : blank);
  }, [visible, initial]);
  const set = (key,value) => setForm(old => ({...old,[key]:value}));
  const submit = () => {
    try {
      if (initial) onSave([{...initial, ...form, amount:Number(String(form.amount).replace(',','.')), dueDate:form.dueDate, status:initial.status || 'pending'}], true);
      else onSave(generateOccurrences(form), false);
      onClose();
    } catch (e) { Alert.alert('Confira os dados', e.message || 'Não foi possível salvar.'); }
  };
  return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <View style={s.container}>
      <View style={s.header}><Text style={s.heading}>{initial ? 'Editar conta' : 'Nova conta'}</Text><Pressable onPress={onClose}><Text style={s.close}>Fechar</Text></Pressable></View>
      <ScrollView contentContainerStyle={{paddingBottom:40}} keyboardShouldPersistTaps="handled">
        <Field label="Nome da conta" value={form.title} onChangeText={v=>set('title',v)} placeholder="Ex.: Conta de energia"/>
        <Field label="Valor (R$)" value={form.amount} onChangeText={v=>set('amount',v)} keyboardType="decimal-pad" placeholder="0,00"/>
        <Text style={s.label}>Categoria</Text><View style={s.chips}>{categories.map(c=><Chip key={c.name} selected={form.category===c.name} onPress={()=>set('category',c.name)}>{c.icon} {c.name}</Chip>)}</View>
        <Field label="Vencimento (AAAA-MM-DD)" value={form.dueDate} onChangeText={v=>set('dueDate',v)} placeholder="2026-12-10"/>
        {!initial && <><Text style={s.label}>Recorrência</Text><View style={s.chips}>
          <Chip selected={form.recurrence==='once'} onPress={()=>set('recurrence','once')}>Única</Chip>
          <Chip selected={form.recurrence==='monthly'} onPress={()=>set('recurrence','monthly')}>Mensal</Chip>
          <Chip selected={form.recurrence==='installments'} onPress={()=>set('recurrence','installments')}>Parcelada</Chip>
        </View>
        {form.recurrence==='installments' && <Field label="Número de parcelas (máx. 120)" value={form.installments} onChangeText={v=>set('installments',v)} keyboardType="number-pad"/>}
        {form.recurrence==='monthly' && <Field label="Data limite (opcional, AAAA-MM-DD)" value={form.endDate} onChangeText={v=>set('endDate',v)} placeholder="Vazio = criar próximos 24 meses"/>}</>}
        <Text style={s.label}>Notificar</Text><View style={s.chips}>
          {[['0','No dia'],['1','1 dia antes'],['2','2 dias'],['3','3 dias'],['7','1 semana']].map(([v,l])=><Chip key={v} selected={String(form.notifyDays)===v} onPress={()=>set('notifyDays',v)}>{l}</Chip>)}
        </View>
        <Field label="Horário da notificação (HH:MM)" value={form.notifyTime} onChangeText={v=>set('notifyTime',v)} placeholder="08:00"/>
        <Field label="Código de barras / chave PIX" value={form.paymentCode} onChangeText={v=>set('paymentCode',v)} placeholder="Opcional"/>
        <Field label="Anotações" value={form.notes} onChangeText={v=>set('notes',v)} placeholder="Observações" multiline/>
        <Pressable onPress={submit} style={s.save}><Text style={s.saveText}>{initial ? 'Salvar alterações' : 'Criar conta'}</Text></Pressable>
      </ScrollView>
    </View>
  </Modal>;
}
const s=StyleSheet.create({
 container:{flex:1,backgroundColor:C.bg,paddingHorizontal:20,paddingTop:18},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:22},
 heading:{color:C.white,fontSize:24,fontWeight:'900'},close:{color:C.red2,fontWeight:'700'},label:{color:C.muted,fontSize:12,fontWeight:'700',marginBottom:8,marginTop:14},
 field:{marginBottom:5},input:{backgroundColor:C.surface,borderColor:C.border,borderWidth:1,borderRadius:13,paddingHorizontal:14,paddingVertical:13,color:C.white,fontSize:15},
 chips:{flexDirection:'row',flexWrap:'wrap',gap:8},chip:{paddingHorizontal:12,paddingVertical:9,borderRadius:11,backgroundColor:C.surface2,borderWidth:1,borderColor:C.border,marginBottom:3},
 chipSelected:{backgroundColor:'#57151B',borderColor:C.red},chipText:{color:C.muted,fontSize:12,fontWeight:'700'},save:{backgroundColor:C.red,padding:16,borderRadius:15,alignItems:'center',marginTop:25},saveText:{color:C.white,fontSize:15,fontWeight:'900'}
});
