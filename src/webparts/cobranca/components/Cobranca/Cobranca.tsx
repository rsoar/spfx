import { IPersonaProps, NormalPeoplePicker, people, SelectedPeopleList } from 'office-ui-fabric-react';

import "@pnp/sp/search";
import { ISearchQuery, SearchResults, SearchQueryBuilder } from "@pnp/sp/search";

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import styles from './Cobranca.module.scss';

import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users";

import { IItemAddResult, IItemUpdateResult, PagedItemCollection } from "@pnp/sp/items";
import { IDataClient } from '../../Interface/IDataClient';

import { PropertyPaneSlider } from '@microsoft/sp-property-pane';
import { ICobrancaProps } from './ICobrancaProps';
import { IDataAdmin } from '../../Interface/IDataAdmin';
import { IList } from '@pnp/sp/lists';

import * as _ from 'lodash';
import { add, filter } from 'lodash';
import { Modal } from '../Modal/Modal';
import { Add } from '../Modal/Add/Add';

function Cobranca (props: ICobrancaProps) {

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [editModal, setEditModal] = useState<boolean>(false);
  const [dataClient, setDataClient] = useState<IDataClient>(null);

  const [adminData, setAdminData] = useState<IDataAdmin>();
  const [listDataClient, setListDataClient] = useState<IDataClient[]>([]);
  const [unfilteredClients, setUnfilteredClients] = useState<IDataClient[]>([]);
  const [client, setClient] = useState<IDataClient>({
    Title: '',
    Motivo: '',
    situacao: '',
    ImageUrl: '',
  });
  const [action, setAction] = useState<number>(0); // 0 - add user ~~~ 1- edit user

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(6);
  const pages = Math.ceil(unfilteredClients.length/pageSize);

  const [currentClients, setCurrentClients] = useState<IPersonaProps[]>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userAdmin = props.context.pageContext.user;
    const allItems: IDataClient[] = await sp.web.lists.getByTitle("Cobranças").items.get();
    
    setAdminData(userAdmin);
    setListDataClient(allItems);
    setUnfilteredClients(allItems);
  }

  const loadMore = (e: any) => setCurrentPage(e.target.value);

  const addClient = async () => {
    if(client.Title == '' || client.Motivo == '' || client.situacao == '' ||  client.ImageUrl == '') return alert("Preencha todos os campos");
    currentClients.forEach(async (item: IPersonaProps) => {
      await sp.web.lists.getByTitle("Cobranças").items.add({
        Title: item.text,
        Motivo: client.Motivo,
        situacao: client.situacao,
        ImageUrl: item.imageUrl
      });
      loadData();
    })
    setClient({...client, Title: '', Motivo: '', situacao: '', ImageUrl: ''});
    setShowAddModal(!showAddModal);
  }
  
  const deleteClient = async (dataClient: IDataClient) => {
    await sp.web.lists.getByTitle("Cobranças").items.getById(dataClient.Id).delete();
    loadData();
  }

  const updateClient = async (data: IDataClient) => {
    const list = await sp.web.lists.getByTitle("Cobranças");
    if(data.Title == '' || data.Motivo == '' || data.situacao == '' ||  data.ImageUrl == '') return alert("Preencha todos os campos");
    await list.items.getById(dataClient.Id).update({
      Title: data.Title,
      Motivo: data.Motivo,
      situacao: data.situacao,
      ImageUrl: data.ImageUrl,
    });
    loadData();
    setEditModal(!editModal);
  }
  
  const loading = unfilteredClients === null;

  const dateFormat = (date: string) => {
    let data = new Date(date);
    let dateFormated = ((data.getDate() )) + "-" + ((data.getMonth() + 1)) + "-" + data.getFullYear(); 
    return dateFormated;
  }
  
  const defineValueInput = (e: React.ChangeEvent<HTMLInputElement>) => setClient({ ...client, [e.target.name]: e.target.value })

  const handleModal = () => {
    setAction(0);
    setShowAddModal(!showAddModal);
  }

  const handleshowDeleteModal = (clientID: IDataClient) => {
    setShowDeleteModal(!showDeleteModal);
    setDataClient(clientID);
  }

  const handleEditModal = (dataClient: IDataClient) => {
    setAction(1);
    setDataClient(dataClient);
    setEditModal(!editModal);
  }

  const handleFilterClients = (e) => {
    const filtered = listDataClient.filter(item => (
      item.Title.toLowerCase().includes(e.target.value) || item.Motivo.toLowerCase().includes(e.target.value) || item.situacao.toLowerCase().includes(e.target.value)
    ));
    setUnfilteredClients(filtered);
  }

  const currentClient = (clients) => {
    setCurrentClients(clients);
    clients.forEach((item: IPersonaProps) => {
      setClient({...client, Id: clients.Id, Title: item.text, ImageUrl: item.imageUrl});
    });
  }

  return (
    <div className={styles.bgContainer}>
      <header>
        <h3>Painel do administrador</h3>
        <div>
          { adminData ? <img className={styles.iconAdmin} src={`/_vti_bin/DelveApi.ashx/people/profileimage?size=S&userId=${adminData.email}`} alt="admin-icon" /> : <img className={styles.iconAdmin} src="https://e7.pngegg.com/pngimages/636/819/png-clipart-computer-icons-privacy-policy-admin-icon-copyright-rim.png" alt="" /> }
          <span>Administrador</span>
        </div>
      </header>
      <main>
        <div className={styles.category}>
          <a href="#" onClick={handleModal}>NOVO CLIENTE</a>
        </div>
        <section className={styles.dataBox}>
          <p>Número de clientes cadastrados: <span className={styles.countBox}>{listDataClient.length}</span></p>
          <p>Clientes com situação <span className={styles.statusPending}>pendente</span>: <span className={styles.countBox}>{listDataClient.filter(data => data.situacao === 'Pendente').length}</span></p>
          <p>Clientes com situação <span className={styles.statusFinish}>finalizado</span>: <span className={styles.countBox}>{listDataClient.filter(data => data.situacao === 'Finalizado').length}</span></p>
        </section>
        <div className={styles.infoHeader}>
          <h2>Lista de clientes</h2>
          <div>
            <div className={styles.teste}>
              <input autoComplete="off" id="searchInput" className={styles.inputSearchClient} type="text" placeholder="Busca..." onChange={handleFilterClients} />
            </div>
          </div>
        </div>
          {loading ? <div className={styles.loadbox}><div className={styles.loading}></div></div> : 
          <>
            <table>
              <tr>
                <th>Cliente</th>
                <th>Data do registro</th>
                <th>Motivo do contato</th>
                <th>Situação</th>
                <th>Ação</th>
              </tr>
            {unfilteredClients !== null && (
              unfilteredClients.slice(currentPage * pageSize, currentPage * pageSize + pageSize).map(dataClient => (
                <tr>
                  <td className={styles.align}><img className={styles.iconAdmin} src={dataClient.ImageUrl} alt={dataClient.Title} /> {dataClient.Title}</td>
                  <td>{dateFormat(dataClient.Created)}</td>
                  <td>{dataClient.Motivo}</td>
                  { dataClient.situacao == 'Finalizado' ? <td className={styles.statusFinish}>{dataClient.situacao}</td> : <td className={styles.statusPending}>{dataClient.situacao}</td> }
                  <td>
                    <button className={styles.deleteInfo} onClick={() => handleshowDeleteModal(dataClient)}>X</button>
                    <button onClick={() => handleEditModal(dataClient)}>Edit</button>
                  </td>
                </tr>
              )))}
            </table>
            <div className={styles.paginationContainer}>
              { Array.from(Array(pages), (item, index) => (
                <div>
                  <button className={styles.paginationButtons} value={index} onClick={(e) => loadMore(e)}>{index + 1}</button>
                </div>
              )) }
            </div>
          </>
        }
        {/* Modal add */}
        { showAddModal ? < Add currentClient={currentClient} action={action} client={client} handleModal={handleModal} defineValueInput={defineValueInput} addClient={addClient} updateClient={updateClient}/> : showAddModal }
        {/* Modal delete */}
        { showDeleteModal ? 
          <div className={styles.modalBackground}>
            <div className={styles.modalContent}>
              <h1>TEM CERTEZA QUE DESEJA EXCLUIR?</h1>
              <div>
                <button onClick={() => setShowDeleteModal(!showDeleteModal)}>NÃO</button>
                <button onClick={() =>{
                  setShowDeleteModal(!showDeleteModal);
                  deleteClient(dataClient);
                }}>SIM</button>
              </div>
            </div>
          </div>
           : !showDeleteModal }
        {/* Modal edit */}
        { editModal ? < Add currentClient={currentClient} action={action} client={client} handleModal={handleEditModal} defineValueInput={defineValueInput} addClient={addClient} updateClient={updateClient}/> 
        : editModal }
      </main>
    </div>
  )
}

export default Cobranca;