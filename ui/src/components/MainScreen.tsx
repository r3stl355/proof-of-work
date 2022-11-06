// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useState } from 'react'
import { Menu } from 'semantic-ui-react'
import MainView from './MainView';
import { User, Coin } from '@daml.js/proof-of-work';
import { PublicParty } from '../Credentials';
import { userContext } from './App';

type Props = {
  onLogout: () => void;
  getPublicParty : () => PublicParty;
}

const toAlias = (userId: string): string =>
  userId.charAt(0).toUpperCase() + userId.slice(1);

const MainScreen: React.FC<Props> = ({onLogout, getPublicParty}) => {
  const user = userContext.useUser();
  const userId = user.userId;
  const party = userContext.useParty();
  const {usePublicParty, setup} = getPublicParty();
  const setupMemo = useCallback(setup, [setup]);
  useEffect(setupMemo);
  const publicParty = usePublicParty();
  const ledger = userContext.useLedger();
  const [createdUser, setCreatedUser] = useState(false);

  const createUserMemo = useCallback(async () => {
    try {
      let userContract = await ledger.fetchByKey(User.User, party);
      if (userContract === null) {
        const params = {party: party, id: userId, name: toAlias(userId)};
        userContract = await ledger.create(User.User, params);
        const ownerParams = {owner: party};
        for (var i = 0; i < 10; i++ ) await ledger.create(Coin.Coin, ownerParams);
      }
      setCreatedUser(true);
    } catch(error) {
      alert(`Unknown error:\n${JSON.stringify(error)}`);
    }
  }, [ledger, party, userId]);

  useEffect(() => {createUserMemo();} , [createUserMemo])

  if (!(createdUser)) {
    return <h1>Logging in...</h1>;
  } else {
    return (
      <>
        <Menu icon borderless>
          <Menu.Menu position='right' className='test-select-main-menu'>
            <Menu.Item position='right'>
              You are logged in as {userId}.
            </Menu.Item>
            <Menu.Item
              position='right'
              active={false}
              className='test-select-log-out'
              onClick={onLogout}
              icon='log out'
            />
          </Menu.Menu>
        </Menu>
        <MainView publicParty={publicParty!} />  
        {/* <MainView publicParty={publicParty ?? ''} /> */}
      </>
    );
  }
};

export default MainScreen;
