import { createContext, useContext, useEffect, useState } from "react";
import { useApiProvider } from "../api/api";
import { ListAthletesProps } from "./athlete.type";
import { useRouter } from "next/navigation";


type AthleteState = {
    listAthletes: ListAthletesProps | null;
    isLoading: boolean;
    injuries: string[];
    success: string;
    error: string;
    call: (ids: number[]) => void
    getInjuries: (id: number | string) => void
    collectiveAssessment: (payload: any) => void
}

const initialState = {
    listAthletes: null,
    isLoading: false,
    injuries: [],
    success: '',
    error: '',
    call: () => {},
    getInjuries: () => {},
    collectiveAssessment: () => {}
}

const AthleteContext = createContext<AthleteState>(initialState);

export const AthleteProvider = ({ children }: {children: React.ReactNode}) => {
    const { get, post, patch } = useApiProvider();
    const [listAthletes, setListAthletes] = useState<ListAthletesProps | null>(null);
    const [success, setSuccess] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [injuries, setInjuries] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter()

    useEffect(() => {
        setError("")
        setSuccess("")
        fetchAthletes();
    }, []);

    const fetchAthletes = async () => {
        setIsLoading(true)
        try {
            const response = await get('/atleta/lista');
            if(response?.data) {
                setListAthletes(response);
            }
        } catch (error) {
            setError("Erro ao carregar a lista de atletas");
        } finally {
            setIsLoading(false)
        }
    };

    const getInjuries = async (id: number | string) => {
        try {
            const response = await get(`lesao/${id}`);

            if (response) { 
                response?.data.map((injurie:any) => {
                    return injurie.regiaoLesao; 
                })

                setInjuries(response.data.map((injurie:any) => injurie.regiaoLesao));
            } else {
                setError("Erro ao carregar lesões!")
            }
        } catch (error) {
            setError("Erro ao carregar lesões!")
        }
    }
    
    const call = async (ids: number[]) => {
        setIsLoading(true)
        try {
            const response = await post('atleta/chamada', JSON.stringify(ids));
            if (response?.status == 204) {
                router.push('/menu');
            } else {
                setError("Tivemos um problema ao realizar a chamada, por favor, tente novamente mais tarde!")
            }
        } catch (error) {
            setError("Erro ao realizar a chamada, por favor, tente novamente mais tarde!")
        } finally {
            setIsLoading(false)
        }
    }

    const collectiveAssessment = async (payload: any) => {
        setIsLoading(true)
        try {
            const response = await patch(`exercicio_coletivo`, JSON.stringify(payload));
            
            if (response?.status == 204) {
                console.log("Avaliação realizada com sucesso!")
                setSuccess("Avaliação realizada com sucesso!")
            } else {
                console.log("Tivemos um problema ao realizar a avaliação, por favor, tente novamente mais tarde!")
                setError("Tivemos um problema ao realizar a avaliação, por favor, tente novamente mais tarde!")
            }
        } catch (error) {
            setError("Erro ao realizar a avaliação, por favor, tente novamente mais tarde!")
        } finally {
            setIsLoading(false)
        }
    }
        
    return (
        <AthleteContext.Provider value={{isLoading, listAthletes, injuries, success, error, call, getInjuries, collectiveAssessment}}>
            {children}
        </AthleteContext.Provider>
    )
}

export const useAthleteProvider = () => useContext(AthleteContext)