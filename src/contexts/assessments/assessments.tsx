import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  IncompleteAssessmentsAPI,
  ResponseIncompleteAssessmentAPI,
} from "@/types/Assessment";
import dayjs, { Dayjs } from "dayjs";
import { useApiProvider } from "../api";
import Modal from "@/components/modal";
import toast from "react-hot-toast";

type AssessmentContext = {
  assessmentData: Dayjs | null | undefined;
  assessment: IncompleteAssessmentsAPI[] | undefined;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  modalVisible: boolean;
  createAssessments: () => void;
  cancelModal: () => void;
  confirmModal: () => void;
  send: (data: any) => Promise<void>;
};

const initialContextState = {
  assessmentData: undefined,
  assessment: undefined,
  isLoading: false,
  modalVisible: true,
  createAssessments: () => {},
  cancelModal: () => {},
  confirmModal: () => {},
  setIsLoading: () => {},
  send: () => Promise.resolve(),
};

const AssessmentsContext =
  createContext<AssessmentContext>(initialContextState);

type Props = {
  children: React.ReactNode;
};

export const AssessmentsProvider = ({ children }: Props) => {
  const { get, post, patch } = useApiProvider();
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(true);

  const [assessmentData, setAssessmentData] = useState<
    Dayjs | null | undefined
  >(undefined);
  const [assessment, setAssessment] = useState<
    IncompleteAssessmentsAPI[] | undefined
  >(undefined);

  const router = useRouter();

  const updateAssesment = (response: ResponseIncompleteAssessmentAPI) => {
    setAssessmentData(dayjs(response.data));
    setAssessment(response.avaliacoesIncompletas);
    console.log("setted Assessment:", response.avaliacoesIncompletas);
  };

  const updateExercise = (data: Array<any>) => {
    if (!assessment) return;

    let newAssessment: any[] = [];

    assessment.forEach((atleta) => {
      data.forEach((incommingExercise) => {
        if (atleta.atletaId === incommingExercise.atletaId) {
          let atletaUpdatedExercises = {
            ...atleta.exercicios,
            ...incommingExercise.resultado,
          };
          newAssessment.push({
            atletaId: atleta.atletaId,
            atletaNome: atleta.atletaNome,
            exercicios: atletaUpdatedExercises,
          });
        }
      });
    });

    setAssessment(newAssessment);
  };

  const getIncompleteAssessments = async () => {
    setIsLoading(true);
    try {
      const response = await get("/avaliacoes_incompletas");
      updateAssesment(response?.data);
      setModalVisible(true);
    } catch (error) {
      router.push("/menu");
    } finally {
      setIsLoading(false);
    }
  };

  const createAssessments = async () => {
    setIsLoading(true);
    try {
      const response = await post("/avaliacaocoletiva", {});
      updateAssesment(response?.data);
    } catch (error) {
      router.push("/menu");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelModal = () => {
    setModalVisible(false);
    router.push("/menu");
  };

  const confirmModal = async () => {
    if (assessment && assessment?.length <= 0) await createAssessments();
    setModalVisible(false);
  };

  const send = async (data: any) => {
    const request = await patch("/exercicio_coletivo", data);
    if (request?.status == 204) {
      updateExercise(data);
      toast.success("As informações foram salvas.");
      router.push("/valencia/menu");
    }
  };

  useEffect(() => {
    getIncompleteAssessments();
  }, []);

  return (
    <AssessmentsContext.Provider
      value={{
        assessmentData,
        assessment,
        isLoading,
        modalVisible,
        cancelModal,
        confirmModal,
        createAssessments,
        setIsLoading,
        send,
      }}
    >
      {modalVisible && !!assessment ? (
        <Modal
          title={
            assessment && assessment?.length > 0
              ? "Existe uma avaliação em andamento...\nDeseja continuar?"
              : "Deseja criar uma nova avaliação?"
          }
          closeModalFunction={cancelModal}
          confirmButtonFunction={confirmModal}
          cancelButtonFunction={cancelModal}
          confirmButtonText={
            assessment && assessment?.length > 0
              ? "Retomar avaliação"
              : "Iniciar nova avaliação"
          }
        />
      ) : (
        children
      )}
    </AssessmentsContext.Provider>
  );
};

export const useAssessmentsProvider = () => useContext(AssessmentsContext);
