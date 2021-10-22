import * as React from 'react';
import { IDataClient } from '../../../Interface/IDataClient';

import styles from '../Modal.module.scss';

interface IProps {
  client: IDataClient
  handleModal: () => void;
  defineValueInput: (e: any) => void;
  addClient: () => void;
}

export const Add = ({ client, handleModal, defineValueInput, addClient }: IProps) => (
  <div className={styles.modalBackground}>
    <div className={styles.modalContent}>
      <button className={styles.closeModal} onClick={handleModal}>X</button>
      <h1>ADICIONAR NOVO CLIENTE</h1>
      <label>Nome do cliente:</label>
      <input id="nameClient" type="text" placeholder="Digite o nome completo do cliente" value={client.Title} onChange={defineValueInput} />
      <label>Motivo:</label>
      <input id="description" type="text" placeholder="Motivo do atendimento" value={client.Motivo} onChange={defineValueInput} />
      <label>Situação:</label>
      <select name="statusClient" id="statusClient" onChange={(e) => defineValueInput(e)}>
        <option value="">----</option>
        <option value="Pendente">Em aberto</option>
        <option value="Finalizado">Finalizado</option>
      </select>
      <button className={styles.addButton} onClick={addClient}>Adicionar</button>
    </div>
  </div>
)