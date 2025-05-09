import { create } from 'zustand';

interface AddressState {
    address: string;
    detail: string;
    contact: string;
    setAddress: (addr: string) => void;
    setDetail: (detail: string) => void;
    setContact: (contact: string) => void;
    reset: () => void;
}

const useAddressStore = create<AddressState>((set) => ({
    address: '',
    detail: '',
    contact: '',
    setAddress: (address) => set({ address }),
    setDetail: (detail) => set({ detail }),
    setContact: (contact) => set({ contact }),
    reset: () => set({ address: '', detail: '', contact: '' }),
}));

export default useAddressStore;
