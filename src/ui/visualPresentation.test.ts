import {describe,expect,it} from 'vitest';
import type {NPC} from '../core/model';
import {avatarTraits} from './apps/chat/ContactAvatar';
import {relationshipLabel} from './apps/chat/Conversation';
import {listingVisualVariant} from './apps/market/ListingThumbnail';
import {accountPresentation} from './apps/bank/BankOverview';

const npc=(role:string,closeness:NPC['closeness']='close'):NPC=>({id:`npc-${role}`,name:'Örnek Kişi',age:40,role,personality:'',education:'',occupation:'',income:0,goal:'',lifeStage:'adult',closeness,relationship:{familiarity:80,warmth:80,trust:80,tension:0},memories:[]});

describe('pure UI identity projections',()=>{
  it('keeps an avatar identity stable while providing useful variety',()=>{expect(avatarTraits('npc-1:Deniz')).toEqual(avatarTraits('npc-1:Deniz'));const variants=new Set(['npc-1','npc-2','npc-3','npc-4','npc-5','npc-6'].map(id=>JSON.stringify(avatarTraits(id))));expect(variants.size).toBeGreaterThan(3)});
  it('never presents a parent as a close friend',()=>{expect(relationshipLabel(npc('Anne'))).toBe('Ailen');expect(relationshipLabel(npc('Baba'))).toBe('Ailen');expect(relationshipLabel(npc('Arkadaş'))).toBe('Yakın arkadaş')});
  it('keeps listing art stable and varies stable listing identities',()=>{const one=listingVisualVariant('listing-1:Ürün','Elektronik');expect(listingVisualVariant('listing-1:Ürün','Elektronik')).toEqual(one);const variants=new Set(['listing-1','listing-2','listing-3','listing-4','listing-5','listing-6'].map(id=>JSON.stringify(listingVisualVariant(id,'Elektronik'))));expect(variants.size).toBeGreaterThan(3)});
  it('projects the account label from age without creating a product',()=>{expect(accountPresentation('2010-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z')).toBe('Genç hesap');expect(accountPresentation('1990-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z')).toBe('Vadesiz hesap')});
});
